import React, { useState, useEffect } from 'react';
import { Oficina, AlunoOficina } from '../types';
import { Matricula } from '@/components/Modulo_Matricula/types';
import { oficinaService, distribuicaoService } from '../services/oficinaService';
import { matriculaService } from '@/services/matriculaService';
import styles from '../styles/DistribuirAlunos.module.css';

interface DistribuirAlunosProps {
  onVoltar: () => void;
}

export default function DistribuirAlunos({ onVoltar }: DistribuirAlunosProps) {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState<Oficina | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<number | null>(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [filtroIdade, setFiltroIdade] = useState<{ min?: number; max?: number }>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [oficinasData, matriculasData] = await Promise.all([
        oficinaService.listar(),
        matriculaService.listar(),
      ]);
      
      console.log('[DistribuirAlunos] Oficinas carregadas:', oficinasData?.length);
      if (oficinasData && oficinasData.length > 0) {
        console.log('[DistribuirAlunos] Primeira oficina:', oficinasData[0]);
        console.log('[DistribuirAlunos] Horários da primeira oficina:', oficinasData[0]?.horarios);
      }
      
      // Filtrar apenas oficinas ativas
      const oficinasAtivas = oficinasData.filter((o) => o.status === 'ativa');
      setOficinas(oficinasAtivas);
      
      // Filtrar matrículas aprovadas ou pendentes
      const matriculasValidas = matriculasData.filter((m) => m.status === 'aprovada' || m.status === 'pendente');
      setMatriculas(matriculasValidas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarOficina = (oficina: Oficina) => {
    console.log('[DistribuirAlunos] Oficina selecionada:', oficina.nome);
    console.log('[DistribuirAlunos] Horários da oficina:', oficina.horarios);
    
    setOficinaSelecionada(oficina);
    setHorarioSelecionado(null);
    setAlunosSelecionados([]);
    
    // Ajustar filtro de idade baseado na oficina
    if (oficina.idadeMinima || oficina.idadeMaxima) {
      setFiltroIdade({
        min: oficina.idadeMinima,
        max: oficina.idadeMaxima,
      });
    } else {
      setFiltroIdade({});
    }
  };

  const handleAdicionarAlunos = async () => {
    if (!oficinaSelecionada || horarioSelecionado === null || alunosSelecionados.length === 0) {
      setErro('Selecione uma oficina, horário e pelo menos um aluno');
      return;
    }

    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      const horario = oficinaSelecionada.horarios[horarioSelecionado];
      if (!horario) {
        throw new Error('Horário não encontrado');
      }

      console.log('[DistribuirAlunos] Horário selecionado:', horario);
      console.log('[DistribuirAlunos] Horário ID:', horario.id);
      
      if (!horario.id) {
        throw new Error('Horário sem ID. A oficina precisa ser recarregada do backend.');
      }

      // Verificar vagas disponíveis
      const vagasOcupadas = horario.alunosMatriculados?.length || 0;
      const vagasDisponiveis = horario.vagas - vagasOcupadas;

      if (alunosSelecionados.length > vagasDisponiveis) {
        throw new Error(`Apenas ${vagasDisponiveis} vagas disponíveis neste horário`);
      }

      // Adicionar alunos ao horário
      for (const alunoId of alunosSelecionados) {
        // Buscar dados completos do aluno
        const matricula = matriculas.find(m => m.id === alunoId);
        if (!matricula) {
          throw new Error(`Matrícula não encontrada: ${alunoId}`);
        }
        
        console.log('[DistribuirAlunos] Adicionando aluno:', {
          matriculaId: alunoId,
          nomeCompleto: matricula.nomeCompleto,
          oficinaId: oficinaSelecionada.id,
          horarioId: horario.id,
          status: 'confirmado',
        });
        
        await distribuicaoService.adicionarAluno({
          alunoId,
          matriculaId: alunoId,
          nomeCompleto: matricula.nomeCompleto,
          oficinaId: oficinaSelecionada.id,
          horarioId: horario.id,
          status: 'confirmado',
        });
      }

      setSucesso(`${alunosSelecionados.length} aluno(s) adicionado(s) com sucesso!`);
      setAlunosSelecionados([]);
      await carregarDados();
      
      // Recarregar oficina selecionada
      const oficinaAtualizada = await oficinaService.buscarPorId(oficinaSelecionada.id);
      setOficinaSelecionada(oficinaAtualizada);
    } catch (error: any) {
      setErro(error.message || 'Erro ao adicionar alunos');
      console.error('[DistribuirAlunos] Erro ao adicionar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAluno = async (alunoId: string) => {
    if (!oficinaSelecionada || horarioSelecionado === null) return;

    if (!confirm('Tem certeza que deseja remover este aluno?')) return;

    setLoading(true);
    try {
      const horario = oficinaSelecionada.horarios[horarioSelecionado];
      if (!horario || !horario.id) {
        throw new Error('Horário não encontrado');
      }
      
      // Usa o método legado que busca a distribuição pelo aluno, oficina e horário
      await distribuicaoService.removerAlunoLegacy(alunoId, oficinaSelecionada.id, horario.id);
      setSucesso('Aluno removido com sucesso!');
      
      // Recarregar oficina
      const oficinaAtualizada = await oficinaService.buscarPorId(oficinaSelecionada.id);
      setOficinaSelecionada(oficinaAtualizada);
    } catch (error) {
      setErro('Erro ao remover aluno');
      console.error('Erro ao remover aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelecionarAluno = (alunoId: string) => {
    if (alunosSelecionados.includes(alunoId)) {
      setAlunosSelecionados(alunosSelecionados.filter((id) => id !== alunoId));
    } else {
      setAlunosSelecionados([...alunosSelecionados, alunoId]);
    }
  };

  const alunosFiltrados = matriculas.filter((matricula) => {
    // Filtro por nome
    if (filtro && !matricula.nomeCompleto.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    // Filtro por idade
    if (filtroIdade.min && matricula.idade && matricula.idade < filtroIdade.min) {
      return false;
    }
    if (filtroIdade.max && matricula.idade && matricula.idade > filtroIdade.max) {
      return false;
    }

    // Verificar se aluno já está matriculado na oficina
    if (oficinaSelecionada) {
      const jaCadastrado = oficinaSelecionada.horarios.some((horario) =>
        horario.alunosMatriculados?.some((aluno) => aluno.matriculaId === matricula.id)
      );
      if (jaCadastrado) return false;
    }

    return true;
  });

  const horarioAtual = (oficinaSelecionada && horarioSelecionado !== null) 
    ? oficinaSelecionada.horarios[horarioSelecionado]
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Distribuir Alunos por Horários</h2>
        <button onClick={onVoltar} className={styles.botaoVoltar}>
          Voltar
        </button>
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

      <div className={styles.conteudo}>
        {/* Seleção de Oficina */}
        <div className={styles.secao}>
          <h3>1. Selecione a Oficina</h3>
          {loading ? (
            <p>Carregando oficinas...</p>
          ) : oficinas.length === 0 ? (
            <p>Nenhuma oficina ativa disponível</p>
          ) : (
            <div className={styles.listaOficinas}>
              {oficinas.map((oficina) => (
                <div
                  key={oficina.id}
                  className={`${styles.oficinaCard} ${
                    oficinaSelecionada?.id === oficina.id ? styles.oficinaAtiva : ''
                  }`}
                  onClick={() => handleSelecionarOficina(oficina)}
                >
                  <h4>{oficina.nome}</h4>
                  <p className={styles.categoria}>{oficina.categoria}</p>
                  <div className={styles.oficinaInfo}>
                    <span>Vagas: {oficina.vagasDisponiveis}/{oficina.vagasTotais}</span>
                    <span>Horários: {oficina.horarios.length}</span>
                  </div>
                  {(oficina.idadeMinima || oficina.idadeMaxima) && (
                    <p className={styles.idadeInfo}>
                      Idade: {oficina.idadeMinima || 0} - {oficina.idadeMaxima || '∞'} anos
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seleção de Horário */}
        {oficinaSelecionada && (
          <div className={styles.secao}>
            <h3>2. Selecione o Horário</h3>
            <div className={styles.listaHorarios}>
              {oficinaSelecionada.horarios.map((horario, index) => {
                const vagasOcupadas = horario.alunosMatriculados?.length || 0;
                const vagasDisponiveis = horario.vagas - vagasOcupadas;
                return (
                  <div
                    key={horario.id || `horario-${index}`}
                    className={`${styles.horarioCard} ${
                      horarioSelecionado === index ? styles.horarioAtivo : ''
                    }`}
                    onClick={() => setHorarioSelecionado(index)}
                  >
                    <h4>
                      {horario.diaSemana.charAt(0).toUpperCase() + horario.diaSemana.slice(1)}
                    </h4>
                    <p>
                      {horario.horaInicio} - {horario.horaFim}
                    </p>
                    <p className={styles.vagas}>
                      {vagasDisponiveis} vagas disponíveis ({vagasOcupadas}/{horario.vagas})
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de alunos do horário selecionado */}
        {horarioAtual && (
          <div className={styles.secao}>
            <h3>Alunos Matriculados neste Horário</h3>
            {!horarioAtual.alunosMatriculados || horarioAtual.alunosMatriculados.length === 0 ? (
              <p>Nenhum aluno matriculado neste horário</p>
            ) : (
              <div className={styles.listaAlunosMatriculados}>
                {horarioAtual.alunosMatriculados.map((aluno) => (
                  <div key={aluno.id} className={styles.alunoMatriculadoCard}>
                    <div>
                      <h4>{aluno.nomeCompleto}</h4>
                      <p>Idade: {aluno.idade} anos</p>
                      {aluno.observacoes && <p className={styles.obs}>{aluno.observacoes}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoverAluno(aluno.matriculaId)}
                      className={styles.botaoRemover}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seleção de Alunos */}
        {horarioSelecionado !== null && (
          <div className={styles.secao}>
            <h3>3. Selecione os Alunos</h3>
            
            <div className={styles.filtros}>
              <input
                type="text"
                placeholder="Buscar aluno por nome..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className={styles.inputFiltro}
              />
              <div className={styles.filtroIdade}>
                <input
                  type="number"
                  placeholder="Idade mín"
                  value={filtroIdade.min || ''}
                  onChange={(e) =>
                    setFiltroIdade({ ...filtroIdade, min: parseInt(e.target.value) || undefined })
                  }
                />
                <input
                  type="number"
                  placeholder="Idade máx"
                  value={filtroIdade.max || ''}
                  onChange={(e) =>
                    setFiltroIdade({ ...filtroIdade, max: parseInt(e.target.value) || undefined })
                  }
                />
              </div>
            </div>

            {alunosFiltrados.length === 0 ? (
              <p>Nenhum aluno disponível para esta oficina</p>
            ) : (
              <>
                <div className={styles.listaAlunos}>
                  {alunosFiltrados.map((matricula) => (
                    <div
                      key={matricula.id}
                      className={`${styles.alunoCard} ${
                        alunosSelecionados.includes(matricula.id!) ? styles.alunoSelecionado : ''
                      }`}
                      onClick={() => toggleSelecionarAluno(matricula.id!)}
                    >
                      <input
                        type="checkbox"
                        checked={alunosSelecionados.includes(matricula.id!)}
                        onChange={() => {}}
                      />
                      <div className={styles.alunoInfo}>
                        <h4>{matricula.nomeCompleto}</h4>
                        <p>Idade: {matricula.idade} anos</p>
                        <p>Turno SCFV: {matricula.turnoSCFV}</p>
                        {matricula.possuiDeficiencia && (
                          <span className={styles.deficiencia}>Possui deficiência</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.botoes}>
                  <p>{alunosSelecionados.length} aluno(s) selecionado(s)</p>
                  <button
                    onClick={handleAdicionarAlunos}
                    disabled={loading || alunosSelecionados.length === 0}
                    className={styles.botaoAdicionar}
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Alunos'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
