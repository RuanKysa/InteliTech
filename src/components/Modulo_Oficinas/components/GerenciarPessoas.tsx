import React, { useState, useEffect } from 'react';
import { Responsavel, AgentesCidadania, Oficina } from '../types';
import { Matricula } from '../../Modulo_Matricula/types';
import { responsavelService, agentesCidadaniaService, oficinaService } from '../services/oficinaService';
import { matriculaService } from '../../../services/matriculaService';
import VisualizadorOficinasAgente from './VisualizadorOficinasAgente';
import styles from '../styles/GerenciarPessoas.module.css';

interface GerenciarPessoasProps {
  onVoltar: () => void;
}

type Aba = 'responsaveis' | 'agentes';

export default function GerenciarPessoas({ onVoltar }: GerenciarPessoasProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('responsaveis');
  
  // Responsáveis
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<Responsavel | null>(null);
  const [modoEdicaoResp, setModoEdicaoResp] = useState(false);
  const [formResp, setFormResp] = useState<Partial<Responsavel>>({
    nome: '',
    tipo: 'professor',
    email: '',
    telefone: '',
    especialidade: '',
    dataAdmissao: '',
  });

  // Agentes Cidadania
  const [agentes, setAgentes] = useState<AgentesCidadania[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Matricula[]>([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<string>('');
  const [dataInicioAgente, setDataInicioAgente] = useState<string>('');
  const [oficinaSelecionada, setOficinaSelecionada] = useState<string>(''); // Nova linha
  
  // Oficinas disponíveis
  const [oficinas, setOficinas] = useState<Oficina[]>([]); // Nova linha
  
  // Visualizador de oficinas do agente
  const [agenteVisualizador, setAgenteVisualizador] = useState<AgentesCidadania | null>(null);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [responsaveisData, agentesData, matriculasData, oficinasData] = await Promise.all([
        responsavelService.listar(),
        agentesCidadaniaService.listar(),
        matriculaService.listar(),
        oficinaService.listar(), // Nova linha
      ]);
      
      console.log('[GerenciarPessoas] Matrículas recebidas:', matriculasData?.length);
      console.log('[GerenciarPessoas] Amostra de matrículas:', matriculasData?.slice(0, 2));
      
      setResponsaveis(responsaveisData);
      setAgentes(agentesData);
      setOficinas(oficinasData); // Nova linha
      
      // Filtrar apenas alunos que não são agentes (aceitar pendentes E aprovadas)
      const alunosNaoAgentes = matriculasData.filter(
        (m: Matricula) => {
          // Aceitar status pendente ou aprovada
          const statusValido = m.status === 'aprovada' || m.status === 'pendente';
          // Verificar se não é agente (undefined ou false)
          const naoEhAgente = !m.agentesCidadania;
          
          console.log(`[GerenciarPessoas] Aluno ${m.nomeCompleto}: status=${m.status}, agentesCidadania=${m.agentesCidadania}, incluir=${statusValido && naoEhAgente}`);
          return statusValido && naoEhAgente;
        }
      );
      
      console.log('[GerenciarPessoas] Alunos disponíveis após filtro:', alunosNaoAgentes.length);
      setAlunosDisponiveis(alunosNaoAgentes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ============= RESPONSÁVEIS =============

  const handleSubmitResponsavel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      if (!formResp.nome || !formResp.tipo) {
        throw new Error('Preencha os campos obrigatórios');
      }

      if (modoEdicaoResp && responsavelSelecionado?.id) {
        await responsavelService.atualizar(responsavelSelecionado.id, formResp);
        setSucesso('Responsável atualizado com sucesso!');
      } else {
        await responsavelService.criar(formResp as Omit<Responsavel, 'id'>);
        setSucesso('Responsável cadastrado com sucesso!');
      }

      await carregarDados();
      limparFormularioResponsavel();
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar responsável');
      console.error('Erro ao salvar responsável:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirResponsavel = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este responsável?')) return;

    setLoading(true);
    setErro(null);
    setSucesso(null);
    
    try {
      await responsavelService.excluir(id);
      setSucesso('Responsável excluído com sucesso!');
      await carregarDados();
    } catch (error: any) {
      const mensagemErro = error?.message || 'Erro ao excluir responsável';
      setErro(mensagemErro);
      console.error('Erro ao excluir responsável:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarResponsavel = (responsavel: Responsavel) => {
    setFormResp(responsavel);
    setResponsavelSelecionado(responsavel);
    setModoEdicaoResp(true);
  };

  const limparFormularioResponsavel = () => {
    setFormResp({
      nome: '',
      tipo: 'professor',
      email: '',
      telefone: '',
      especialidade: '',
      dataAdmissao: '',
    });
    setResponsavelSelecionado(null);
    setModoEdicaoResp(false);
  };

  // ============= AGENTES CIDADANIA =============

  const handleDefinirAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      if (!matriculaSelecionada || !dataInicioAgente) {
        throw new Error('Selecione um aluno e informe a data de início');
      }

      // Passar oficinaIds como array (backend espera array)
      const oficinasIds = oficinaSelecionada ? [oficinaSelecionada] : [];
      
      await agentesCidadaniaService.definirAgente(
        matriculaSelecionada, 
        dataInicioAgente,
        oficinasIds
      );
      setSucesso('Aluno definido como Agente Cidadania com sucesso!');

      setMatriculaSelecionada('');
      setDataInicioAgente('');
      setOficinaSelecionada(''); // Limpar oficina selecionada
      await carregarDados();
    } catch (error: any) {
      setErro(error.message || 'Erro ao definir agente cidadania');
      console.error('Erro ao definir agente cidadania:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAgente = async (matriculaId: string) => {
    if (!confirm('Tem certeza que deseja remover o status de Agente Cidadania deste aluno?')) return;

    setLoading(true);
    try {
      await agentesCidadaniaService.removerAgente(matriculaId);
      setSucesso('Status de Agente Cidadania removido com sucesso!');
      await carregarDados();
    } catch (error) {
      setErro('Erro ao remover agente cidadania');
      console.error('Erro ao remover agente cidadania:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarOficinaAgente = async (agenteId: string, oficinaAtualId?: string) => {
    const novaOficinaId = prompt(
      `Selecione o ID da nova oficina para este agente.\n\nOficinas disponíveis:\n${oficinas
        .filter((of) => of.status === 'ativa' || of.status === 'planejada')
        .map((of) => `${of.id}: ${of.nome}`)
        .join('\n')}\n\nDigite o ID da oficina (ou deixe vazio para remover vínculo):`,
      oficinaAtualId || ''
    );

    if (novaOficinaId === null) return; // Usuário cancelou

    setLoading(true);
    try {
      await agentesCidadaniaService.atualizar(agenteId, {
        oficinaId: novaOficinaId || undefined,
      });
      setSucesso('Oficina do agente atualizada com sucesso!');
      await carregarDados();
    } catch (error) {
      setErro('Erro ao alterar oficina do agente');
      console.error('Erro ao alterar oficina do agente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Gerenciar Pessoas</h2>
          <button onClick={onVoltar} className={styles.botaoVoltar}>
            Voltar
          </button>
        </div>

      {erro && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

      {/* Abas */}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${abaAtiva === 'responsaveis' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('responsaveis')}
        >
          Responsáveis ({responsaveis.length})
        </button>
        <button
          className={`${styles.aba} ${abaAtiva === 'agentes' ? styles.abaAtiva : ''}`}
          onClick={() => setAbaAtiva('agentes')}
        >
          Agentes Cidadania ({agentes.filter((a) => a.status === 'ativo').length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className={styles.conteudo}>
        {/* ABA RESPONSÁVEIS */}
        {abaAtiva === 'responsaveis' && (
          <div className={styles.abaConteudo}>
            <div className={styles.formulario}>
              <h3>{modoEdicaoResp ? 'Editar Responsável' : 'Novo Responsável'}</h3>
              <form onSubmit={handleSubmitResponsavel}>
                <div className={styles.grid}>
                  <div className={styles.campo}>
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={formResp.nome}
                      onChange={(e) => setFormResp({ ...formResp, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.campo}>
                    <label>Tipo *</label>
                    <select
                      value={formResp.tipo}
                      onChange={(e) => setFormResp({ ...formResp, tipo: e.target.value as any })}
                      required
                    >
                      <option value="professor">Professor</option>
                      <option value="estagiario">Estagiário</option>
                    </select>
                  </div>

                  <div className={styles.campo}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formResp.email}
                      onChange={(e) => setFormResp({ ...formResp, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={formResp.telefone}
                      onChange={(e) => setFormResp({ ...formResp, telefone: e.target.value })}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label>Especialidade</label>
                    <input
                      type="text"
                      value={formResp.especialidade}
                      onChange={(e) => setFormResp({ ...formResp, especialidade: e.target.value })}
                    />
                  </div>

                  <div className={styles.campo}>
                    <label>Data de Admissão</label>
                    <input
                      type="date"
                      value={formResp.dataAdmissao}
                      onChange={(e) => setFormResp({ ...formResp, dataAdmissao: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.botoes}>
                  <button type="submit" disabled={loading} className={styles.botaoSalvar}>
                    {loading ? 'Salvando...' : modoEdicaoResp ? 'Atualizar' : 'Cadastrar'}
                  </button>
                  {modoEdicaoResp && (
                    <button
                      type="button"
                      onClick={limparFormularioResponsavel}
                      className={styles.botaoCancelar}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className={styles.lista}>
              <h3>
                <span>Responsáveis Cadastrados</span>
                <span className={styles.contador}>{responsaveis.length}</span>
              </h3>
              {loading ? (
                <div className={styles.emptyState}>
                  <p>⏳ Carregando...</p>
                </div>
              ) : responsaveis.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Nenhum responsável cadastrado ainda</p>
                  <small>Preencha o formulário ao lado para adicionar o primeiro responsável</small>
                </div>
              ) : (
                <div className={styles.listaCards}>
                  {responsaveis.map((resp) => (
                    <div key={resp.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h4>{resp.nome}</h4>
                        <span className={`${styles.tipo} ${styles[resp.tipo]}`}>{resp.tipo}</span>
                      </div>
                      
                      {resp.especialidade && (
                        <div className={styles.infoItem}>
                          <span>🎯</span>
                          <span>{resp.especialidade}</span>
                        </div>
                      )}
                      
                      {resp.email && (
                        <div className={styles.infoItem}>
                          <span>📧</span>
                          <span>{resp.email}</span>
                        </div>
                      )}
                      
                      {resp.telefone && (
                        <div className={styles.infoItem}>
                          <span>📱</span>
                          <span>{resp.telefone}</span>
                        </div>
                      )}
                      
                      {resp.dataAdmissao && (
                        <p className={styles.data}>
                          📅 Admitido em: {new Date(resp.dataAdmissao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      
                      <div className={styles.acoes}>
                        <button
                          onClick={() => handleEditarResponsavel(resp)}
                          className={styles.botaoEditar}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluirResponsavel(resp.id)}
                          className={styles.botaoExcluir}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA AGENTES CIDADANIA */}
        {abaAtiva === 'agentes' && (
          <div className={styles.abaConteudo}>
            <div className={styles.formulario}>
              <h3>Definir Aluno como Agente Cidadania</h3>
              <p className={styles.descricao}>
                Selecione um aluno matriculado aprovado para atribuir a função de Agente Cidadania.
              </p>
              <form onSubmit={handleDefinirAgente}>
                <div className={styles.grid}>
                  <div className={styles.campo}>
                    <label>Aluno Matriculado *</label>
                    <select
                      value={matriculaSelecionada}
                      onChange={(e) => setMatriculaSelecionada(e.target.value)}
                      required
                    >
                      <option value="">Selecione um aluno...</option>
                      {alunosDisponiveis.map((matricula) => (
                        <option key={matricula.id} value={matricula.id}>
                          {matricula.nomeCompleto} - {matricula.cpf} ({matricula.idade} anos)
                        </option>
                      ))}
                    </select>
                    {alunosDisponiveis.length === 0 && (
                      <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                        Não há alunos disponíveis. Todos os alunos aprovados já são agentes ou não há matrículas aprovadas.
                      </small>
                    )}
                  </div>

                  <div className={styles.campo}>
                    <label>Data de Início como Agente *</label>
                    <input
                      type="date"
                      value={dataInicioAgente}
                      onChange={(e) => setDataInicioAgente(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.campo}>
                    <label>Oficina (Opcional)</label>
                    <select
                      value={oficinaSelecionada}
                      onChange={(e) => setOficinaSelecionada(e.target.value)}
                    >
                      <option value="">Nenhuma oficina específica</option>
                      {oficinas
                        .filter((of) => of.status === 'ativa' || of.status === 'planejada')
                        .map((oficina) => (
                          <option key={oficina.id} value={oficina.id}>
                            {oficina.nome} - {oficina.categoria}
                          </option>
                        ))}
                    </select>
                    <small style={{ color: '#64748b', marginTop: '4px', display: 'block', fontSize: '12px' }}>
                      Selecione a oficina principal onde o agente atuará
                    </small>
                  </div>
                </div>

                <div className={styles.botoes}>
                  <button 
                    type="submit" 
                    disabled={loading || alunosDisponiveis.length === 0} 
                    className={styles.botaoSalvar}
                  >
                    {loading ? 'Definindo...' : 'Definir como Agente'}
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.lista}>
              <h3>
                <span>Agentes Cidadania Ativos</span>
                <span className={styles.contador}>
                  {agentes.filter((a) => a.status === 'ativo').length}
                </span>
              </h3>
              {loading ? (
                <div className={styles.emptyState}>
                  <p>⏳ Carregando...</p>
                </div>
              ) : agentes.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Nenhum agente cidadania definido ainda</p>
                  <small>Selecione um aluno matriculado no formulário acima para torná-lo agente</small>
                </div>
              ) : (
                <div className={styles.listaCards}>
                  {agentes.map((agente) => (
                    <div key={agente.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h4>{agente.nome}</h4>
                        <span className={`${styles.status} ${styles.ativo}`}>
                          Agente
                        </span>
                      </div>
                      
                      {agente.cpf && (
                        <div className={styles.infoItem}>
                          <span>🆔</span>
                          <span>CPF: {agente.cpf}</span>
                        </div>
                      )}
                      
                      {agente.dataNascimento && (
                        <div className={styles.infoItem}>
                          <span>🎂</span>
                          <span>
                            Nascimento: {new Date(agente.dataNascimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      
                      {agente.telefone && (
                        <div className={styles.infoItem}>
                          <span>📱</span>
                          <span>{agente.telefone}</span>
                        </div>
                      )}
                      
                      {agente.oficinaId && (
                        <div className={styles.infoItem} style={{ background: '#dbeafe', fontWeight: 600, color: '#1e40af' }}>
                          <span>🎯</span>
                          <span>
                            Oficina: {oficinas.find((of) => of.id === agente.oficinaId)?.nome || 'Não encontrada'}
                          </span>
                        </div>
                      )}
                      
                      {agente.dataInicio && (
                        <p className={styles.data}>
                          📅 Agente desde: {new Date(agente.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      
                      <div className={styles.acoes}>
                        <button
                          onClick={() => setAgenteVisualizador(agente)}
                          className={styles.botaoVisualizar}
                        >
                          🎯 Ver Oficinas
                        </button>
                        {agente.oficinaId ? (
                          <button
                            onClick={() => handleAlterarOficinaAgente(agente.id, agente.oficinaId)}
                            className={styles.botaoEditar}
                            style={{ '--icon': '"\ud83d\udd04"' } as any}
                          >
                            Alterar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAlterarOficinaAgente(agente.id)}
                            className={styles.botaoEditar}
                            style={{ '--icon': '"🔗"' } as any}
                          >
                            Vincular Oficina
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoverAgente(agente.matriculaId)}
                          className={styles.botaoExcluir}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Modal Visualizador de Oficinas do Agente */}
      {agenteVisualizador && (
        <VisualizadorOficinasAgente
          agente={agenteVisualizador}
          onFechar={() => setAgenteVisualizador(null)}
          onAtualizar={carregarDados}
        />
      )}
    </>
  );
};
