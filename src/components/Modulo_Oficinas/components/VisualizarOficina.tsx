import React, { useState, useEffect } from 'react';
import { Oficina, Responsavel, AgentesCidadania } from '../types';
import { Matricula } from '@/components/Modulo_Matricula/types';
import { oficinaService, responsavelService, agentesCidadaniaService, distribuicaoService } from '../services/oficinaService';
import { matriculaService } from '@/services/matriculaService';
import styles from '../styles/VisualizarOficina.module.css';

interface VisualizarOficinaProps {
  oficinaId: string;
  onVoltar: () => void;
}

export default function VisualizarOficina({ oficinaId, onVoltar }: VisualizarOficinaProps) {
  const [oficina, setOficina] = useState<Oficina | null>(null);
  const [responsavel, setResponsavel] = useState<Responsavel | null>(null);
  const [agentes, setAgentes] = useState<AgentesCidadania[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunosOficina, setAlunosOficina] = useState<any[]>([]); // Alunos inscritos na oficina
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'alunos' | 'horarios' | 'equipe'>('geral');

  useEffect(() => {
    carregarDados();
  }, [oficinaId]);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      console.log('[VisualizarOficina] Carregando oficina:', oficinaId);
      
      // Carregar oficina
      const oficinaData = await oficinaService.buscarPorId(oficinaId);
      console.log('[VisualizarOficina] Oficina carregada:', oficinaData);
      setOficina(oficinaData);

      // Carregar alunos da oficina
      try {
        const alunosData = await distribuicaoService.listarAlunosOficina(oficinaId);
        console.log('[VisualizarOficina] Alunos da oficina:', alunosData);
        setAlunosOficina(alunosData || []);
        
        // Mapear alunos para os horários da oficina
        if (oficinaData.horarios && alunosData) {
          oficinaData.horarios.forEach(horario => {
            const alunosDoHorario = alunosData.filter((a: any) => a.horarioId === horario.id);
            // Converter DistribuicaoAluno para AlunoOficina
            horario.alunosMatriculados = alunosDoHorario.map((dist: any) => ({
              id: dist.alunoId || dist.id,
              matriculaId: dist.matriculaId || dist.alunoId,
              nomeCompleto: dist.nomeCompleto,
              idade: dist.idade || 0,
              turno: dist.turno,
              observacoes: dist.observacoes,
              dataInscricao: dist.dataInscricao ? new Date(dist.dataInscricao) : new Date(),
            }));
            console.log(`[VisualizarOficina] Horário ${horario.id} tem ${alunosDoHorario.length} alunos`);
          });
          setOficina({ ...oficinaData }); // Atualizar oficina com alunos nos horários
        }
      } catch (error) {
        console.error('Erro ao carregar alunos da oficina:', error);
        setAlunosOficina([]);
      }

      // Carregar responsável se existir
      if (oficinaData.responsavelId) {
        try {
          const responsavelData = await responsavelService.buscarPorId(oficinaData.responsavelId);
          setResponsavel(responsavelData);
        } catch (error) {
          console.error('Erro ao carregar responsável:', error);
        }
      }

      // Carregar agentes de cidadania
      try {
        const agentesData = await agentesCidadaniaService.listar();
        setAgentes(agentesData);
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      }

      // Carregar matrículas para pegar dados completos dos alunos
      try {
        const matriculasData = await matriculaService.listar();
        console.log('[VisualizarOficina] Matrículas carregadas:', matriculasData?.length);
        setMatriculas(matriculasData);
      } catch (error) {
        console.error('Erro ao carregar matrículas:', error);
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao carregar dados da oficina');
      console.error('Erro ao carregar oficina:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatriculaData = (matriculaId: string) => {
    return matriculas.find(m => m.id === matriculaId);
  };

  const formatarData = (data: string | Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDiaSemana = (dia: string) => {
    const dias: any = {
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado'
    };
    return dias[dia] || dia;
  };

  const getStatusBadge = (status: string) => {
    const classes: any = {
      'planejada': styles.statusPlanejada,
      'ativa': styles.statusAtiva,
      'suspensa': styles.statusSuspensa,
      'encerrada': styles.statusEncerrada,
    };
    return classes[status] || '';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados da oficina...</div>
      </div>
    );
  }

  if (erro || !oficina) {
    return (
      <div className={styles.container}>
        <div className={styles.erro}>{erro || 'Oficina não encontrada'}</div>
        <button onClick={onVoltar} className={styles.botaoVoltar}>
          Voltar
        </button>
      </div>
    );
  }

  // Contar totais
  const totalAlunos = alunosOficina.length || oficina.horarios.reduce((acc, h) => acc + (h.alunosMatriculados?.length || 0), 0);
  const totalVagas = oficina.horarios.reduce((acc, h) => acc + h.vagas, 0);
  const vagasOcupadas = totalAlunos;
  const percentualOcupacao = totalVagas > 0 ? ((vagasOcupadas / totalVagas) * 100).toFixed(1) : '0';

  console.log('[VisualizarOficina] Renderizando - Total alunos:', totalAlunos);
  console.log('[VisualizarOficina] Alunos na oficina:', alunosOficina);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <button onClick={onVoltar} className={styles.botaoVoltar}>
            ← Voltar
          </button>
          <div className={styles.titulo}>
            <h1>{oficina.nome}</h1>
            <span className={`${styles.statusBadge} ${getStatusBadge(oficina.status)}`}>
              {oficina.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Alunos Inscritos</span>
            <span className={styles.statValue}>{totalAlunos}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Vagas Totais</span>
            <span className={styles.statValue}>{totalVagas}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Ocupação</span>
            <span className={styles.statValue}>{percentualOcupacao}%</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${abaAtiva === 'geral' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('geral')}
        >
          📋 Informações Gerais
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'alunos' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('alunos')}
        >
          👥 Alunos ({totalAlunos})
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'horarios' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('horarios')}
        >
          🕐 Horários ({oficina.horarios.length})
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'equipe' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('equipe')}
        >
          👨‍🏫 Equipe
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className={styles.conteudoAba}>
        {abaAtiva === 'geral' && (
          <div className={styles.informacoesGerais}>
            <div className={styles.card}>
              <h3>Detalhes da Oficina</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <strong>Categoria:</strong>
                  <span className={styles.categoria}>{oficina.categoria}</span>
                </div>
                <div className={styles.infoItem}>
                  <strong>Período:</strong>
                  <span>{formatarData(oficina.dataInicio)} até {formatarData(oficina.dataFim)}</span>
                </div>
                <div className={styles.infoItem}>
                  <strong>Local:</strong>
                  <span>{oficina.local || 'Não informado'}</span>
                </div>
                <div className={styles.infoItem}>
                  <strong>Sala:</strong>
                  <span>{oficina.sala || 'Não informada'}</span>
                </div>
                <div className={styles.infoItem}>
                  <strong>Idade:</strong>
                  <span>
                    {oficina.idadeMinima && oficina.idadeMaxima
                      ? `${oficina.idadeMinima} a ${oficina.idadeMaxima} anos`
                      : 'Todas as idades'}
                  </span>
                </div>
              </div>
              
              {oficina.descricao && (
                <div className={styles.descricao}>
                  <strong>Descrição:</strong>
                  <p>{oficina.descricao}</p>
                </div>
              )}

              {oficina.materiais && oficina.materiais.length > 0 && (
                <div className={styles.materiais}>
                  <strong>Materiais Necessários:</strong>
                  <ul>
                    {oficina.materiais.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'alunos' && (
          <div className={styles.listaAlunos}>
            <div className={styles.card}>
              <h3>Alunos Inscritos na Oficina</h3>
              {totalAlunos === 0 ? (
                <p className={styles.mensagemVazia}>Nenhum aluno inscrito ainda.</p>
              ) : (
                <div className={styles.tabelaWrapper}>
                  <table className={styles.tabela}>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Turno SCFV</th>
                        <th>Horário</th>
                        <th>Telefone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunosOficina.map((aluno) => {
                        const matricula = getMatriculaData(aluno.matriculaId);
                        const horario = oficina.horarios.find(h => h.id === aluno.horarioId);
                        
                        console.log('[VisualizarOficina] Renderizando aluno:', aluno.nomeCompleto, 'Horário:', horario);
                        
                        return (
                          <tr key={aluno.id}>
                            <td className={styles.nomeAluno}>{aluno.nomeCompleto}</td>
                            <td>{aluno.idade || matricula?.idade || '-'}</td>
                            <td>{aluno.turno || matricula?.turnoSCFV || '-'}</td>
                            <td className={styles.horarioInfo}>
                              {horario ? (
                                <>
                                  {formatarDiaSemana(horario.diaSemana)}<br />
                                  <small>{horario.horaInicio} - {horario.horaFim}</small>
                                </>
                              ) : (
                                'Horário não encontrado'
                              )}
                            </td>
                            <td>{matricula?.telefone || '-'}</td>
                            <td>
                              <span className={styles.statusAluno}>
                                {aluno.status || matricula?.status || 'pendente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'horarios' && (
          <div className={styles.listaHorarios}>
            <div className={styles.horariosGrid}>
              {oficina.horarios.map((horario, index) => {
                const alunosNoHorario = horario.alunosMatriculados?.length || 0;
                const vagasDisponiveis = horario.vagas - alunosNoHorario;
                const percentual = ((alunosNoHorario / horario.vagas) * 100).toFixed(0);
                
                return (
                  <div key={horario.id || index} className={styles.horarioCard}>
                    <div className={styles.horarioHeader}>
                      <h4>{formatarDiaSemana(horario.diaSemana)}</h4>
                      <div className={styles.horarioTime}>
                        {horario.horaInicio} - {horario.horaFim}
                      </div>
                    </div>
                    
                    <div className={styles.horarioInfo2}>
                      <div className={styles.vagasInfo}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                        <span className={styles.vagasTexto}>
                          {alunosNoHorario} / {horario.vagas} vagas
                          {vagasDisponiveis > 0 && (
                            <small> ({vagasDisponiveis} disponíveis)</small>
                          )}
                        </span>
                      </div>
                    </div>

                    {horario.alunosMatriculados && horario.alunosMatriculados.length > 0 && (
                      <div className={styles.alunosHorario}>
                        <strong>Alunos inscritos:</strong>
                        <ul>
                          {horario.alunosMatriculados.map((aluno) => (
                            <li key={aluno.id}>{aluno.nomeCompleto}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {abaAtiva === 'equipe' && (
          <div className={styles.equipe}>
            <div className={styles.card}>
              <h3>👨‍🏫 Responsável pela Oficina</h3>
              {responsavel ? (
                <div className={styles.responsavelCard}>
                  <div className={styles.responsavelInfo}>
                    <div className={styles.avatar}>
                      {responsavel.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{responsavel.nome}</h4>
                      <p className={styles.cargo}>
                        {responsavel.tipo === 'professor' ? '👨‍🏫 Professor' : '🎓 Estagiário'}
                      </p>
                      {responsavel.especialidade && (
                        <p className={styles.especialidade}>
                          Especialidade: {responsavel.especialidade}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.responsavelContato}>
                    {responsavel.email && (
                      <p>📧 {responsavel.email}</p>
                    )}
                    {responsavel.telefone && (
                      <p>📞 {responsavel.telefone}</p>
                    )}
                    {responsavel.dataAdmissao && (
                      <p>📅 Admissão: {formatarData(responsavel.dataAdmissao)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className={styles.mensagemVazia}>Nenhum responsável atribuído.</p>
              )}
            </div>

            <div className={styles.card}>
              <h3>🌟 Agentes de Cidadania</h3>
              {agentes.length > 0 ? (
                <div className={styles.agentesGrid}>
                  {agentes.filter(a => a.status === 'ativo').map((agente) => (
                    <div key={agente.id} className={styles.agenteCard}>
                      <div className={styles.agenteAvatar}>
                        {agente.nome.charAt(0).toUpperCase()}
                      </div>
                      <h4>{agente.nome}</h4>
                      <p className={styles.agenteIdade}>
                        {agente.idade ? `${agente.idade} anos` : 'Idade não informada'}
                      </p>
                      {agente.turnoSCFV && (
                        <p className={styles.agenteTurno}>Turno: {agente.turnoSCFV}</p>
                      )}
                      <p className={styles.agenteData}>
                        Desde: {formatarData(agente.dataInicio)}
                      </p>
                      {agente.telefone && (
                        <p className={styles.agenteTelefone}>📞 {agente.telefone}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.mensagemVazia}>Nenhum agente de cidadania cadastrado.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
