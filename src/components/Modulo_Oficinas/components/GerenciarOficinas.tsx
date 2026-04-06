import React, { useState, useEffect } from 'react';
import { Oficina, Responsavel, Horario } from '../types';
import { oficinaService, responsavelService } from '../services/oficinaService';
import styles from '../styles/GerenciarOficinas.module.css';

interface GerenciarOficinasProps {
  onVoltar: () => void;
  oficinaParaEditar?: Oficina;
  onVisualizarOficina?: (oficinaId: string) => void;
}

export default function GerenciarOficinas({ onVoltar, oficinaParaEditar, onVisualizarOficina }: GerenciarOficinasProps) {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [oficinaSelecionada, setOficinaSelecionada] = useState<Oficina | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Formulário
  const [formData, setFormData] = useState<Partial<Oficina>>({
    nome: '',
    descricao: '',
    categoria: 'outras',
    responsavelId: '',
    horarios: [],
    vagasTotais: 0,
    vagasDisponiveis: 0,
    dataInicio: '',
    dataFim: '',
    local: '',
    sala: '',
    materiais: [],
    status: 'planejada',
    idadeMinima: undefined,
    idadeMaxima: undefined,
  });

  const [novoHorario, setNovoHorario] = useState<Partial<Horario>>({
    diaSemana: 'segunda',
    horaInicio: '',
    horaFim: '',
    vagas: 0,
    alunosMatriculados: [],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (oficinaParaEditar) {
      setFormData(oficinaParaEditar);
      setModoEdicao(true);
      setOficinaSelecionada(oficinaParaEditar);
    }
  }, [oficinaParaEditar]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [oficinasData, responsaveisData] = await Promise.all([
        oficinaService.listar(),
        responsavelService.listar(),
      ]);
      setOficinas(oficinasData);
      setResponsaveis(responsaveisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      // Validações
      if (!formData.nome || !formData.categoria || !formData.dataInicio || !formData.dataFim) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (formData.horarios && formData.horarios.length === 0) {
        throw new Error('Adicione pelo menos um horário');
      }

      // Calcular vagas totais baseado nos horários
      const vagasTotais = formData.horarios?.reduce((total, h) => total + h.vagas, 0) || 0;
      
      const dadosOficina = {
        ...formData,
        vagasTotais,
        vagasDisponiveis: vagasTotais,
      } as Oficina;

      if (modoEdicao && oficinaSelecionada?.id) {
        await oficinaService.atualizar(oficinaSelecionada.id, dadosOficina);
        setSucesso('Oficina atualizada com sucesso!');
      } else {
        await oficinaService.criar(dadosOficina);
        setSucesso('Oficina criada com sucesso!');
      }

      await carregarDados();
      limparFormulario();
      setModoEdicao(false);
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar oficina');
      console.error('Erro ao salvar oficina:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta oficina?')) return;

    setLoading(true);
    try {
      await oficinaService.excluir(id);
      setSucesso('Oficina excluída com sucesso!');
      await carregarDados();
    } catch (error) {
      setErro('Erro ao excluir oficina');
      console.error('Erro ao excluir oficina:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (oficina: Oficina) => {
    setFormData(oficina);
    setOficinaSelecionada(oficina);
    setModoEdicao(true);
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'outras',
      responsavelId: '',
      horarios: [],
      vagasTotais: 0,
      vagasDisponiveis: 0,
      dataInicio: '',
      dataFim: '',
      local: '',
      sala: '',
      materiais: [],
      status: 'planejada',
      idadeMinima: undefined,
      idadeMaxima: undefined,
    });
    setOficinaSelecionada(null);
    setModoEdicao(false);
  };

  const adicionarHorario = () => {
    if (!novoHorario.diaSemana || !novoHorario.horaInicio || !novoHorario.horaFim || !novoHorario.vagas) {
      alert('Preencha todos os campos do horário');
      return;
    }

    const horarioCompleto: Horario = {
      diaSemana: novoHorario.diaSemana as Horario['diaSemana'],
      horaInicio: novoHorario.horaInicio,
      horaFim: novoHorario.horaFim,
      vagas: novoHorario.vagas,
      alunosMatriculados: [],
    };

    setFormData({
      ...formData,
      horarios: [...(formData.horarios || []), horarioCompleto],
    });

    setNovoHorario({
      diaSemana: 'segunda',
      horaInicio: '',
      horaFim: '',
      vagas: 0,
      alunosMatriculados: [],
    });
  };

  const removerHorario = (index: number) => {
    const novosHorarios = [...(formData.horarios || [])];
    novosHorarios.splice(index, 1);
    setFormData({ ...formData, horarios: novosHorarios });
  };

  const adicionarMaterial = () => {
    const material = prompt('Digite o material necessário:');
    if (material) {
      setFormData({
        ...formData,
        materiais: [...(formData.materiais || []), material],
      });
    }
  };

  const removerMaterial = (index: number) => {
    const novosMateriais = [...(formData.materiais || [])];
    novosMateriais.splice(index, 1);
    setFormData({ ...formData, materiais: novosMateriais });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Gerenciar Oficinas</h2>
        <button onClick={onVoltar} className={styles.botaoVoltar}>
          Voltar
        </button>
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

      <div className={styles.conteudo}>
        {/* Formulário */}
        <div className={styles.formulario}>
          <h3>{modoEdicao ? 'Editar Oficina' : 'Nova Oficina'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label>Nome da Oficina *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className={styles.campo}>
                <label>Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                  required
                >
                  <option value="esporte">Esporte</option>
                  <option value="arte">Arte</option>
                  <option value="musica">Música</option>
                  <option value="danca">Dança</option>
                  <option value="artesanato">Artesanato</option>
                  <option value="informatica">Informática</option>
                  <option value="idiomas">Idiomas</option>
                  <option value="outras">Outras</option>
                </select>
              </div>

              <div className={styles.campo}>
                <label>Responsável</label>
                <select
                  value={formData.responsavelId}
                  onChange={(e) => setFormData({ ...formData, responsavelId: e.target.value })}
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp) => (
                    <option key={resp.id} value={resp.id}>
                      {resp.nome} ({resp.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="planejada">Planejada</option>
                  <option value="ativa">Ativa</option>
                  <option value="suspensa">Suspensa</option>
                  <option value="encerrada">Encerrada</option>
                </select>
              </div>

              <div className={styles.campo}>
                <label>Data Início *</label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  required
                />
              </div>

              <div className={styles.campo}>
                <label>Data Fim *</label>
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  required
                />
              </div>

              <div className={styles.campo}>
                <label>Idade Mínima</label>
                <input
                  type="number"
                  value={formData.idadeMinima || ''}
                  onChange={(e) => setFormData({ ...formData, idadeMinima: parseInt(e.target.value) || undefined })}
                />
              </div>

              <div className={styles.campo}>
                <label>Idade Máxima</label>
                <input
                  type="number"
                  value={formData.idadeMaxima || ''}
                  onChange={(e) => setFormData({ ...formData, idadeMaxima: parseInt(e.target.value) || undefined })}
                />
              </div>

              <div className={styles.campo}>
                <label>Local</label>
                <input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                />
              </div>

              <div className={styles.campo}>
                <label>Sala</label>
                <input
                  type="text"
                  value={formData.sala}
                  onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label>Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            {/* Horários */}
            <div className={styles.secao}>
              <h4>Horários</h4>
              
              {/* Atalhos de horários predefinidos */}
              <div className={styles.horariosAtalhos}>
                <label>Dia da Semana:</label>
                <select
                  value={novoHorario.diaSemana}
                  onChange={(e) => setNovoHorario({ ...novoHorario, diaSemana: e.target.value as any })}
                >
                  <option value="segunda">Segunda-feira</option>
                  <option value="terca">Terça-feira</option>
                  <option value="quarta">Quarta-feira</option>
                  <option value="quinta">Quinta-feira</option>
                  <option value="sexta">Sexta-feira</option>
                  <option value="sabado">Sábado</option>
                </select>
                
                <label style={{ marginTop: '10px' }}>Vagas por horário:</label>
                <input
                  type="number"
                  placeholder="Ex: 20"
                  value={novoHorario.vagas}
                  onChange={(e) => setNovoHorario({ ...novoHorario, vagas: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                
                <div className={styles.botoesHorarios}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const horariosManha = [
                        { horaInicio: '08:00', horaFim: '09:00' },
                        { horaInicio: '09:00', horaFim: '10:00' },
                        { horaInicio: '10:00', horaFim: '11:00' },
                        { horaInicio: '11:00', horaFim: '12:00' }
                      ];
                      const novosHorarios: Horario[] = horariosManha.map(h => ({
                        diaSemana: novoHorario.diaSemana as 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado',
                        horaInicio: h.horaInicio,
                        horaFim: h.horaFim,
                        vagas: novoHorario.vagas || 20,
                        alunosMatriculados: []
                      }));
                      setFormData({
                        ...formData,
                        horarios: [...(formData.horarios || []), ...novosHorarios]
                      });
                    }}
                    className={styles.botaoAtalho}
                  >
                    + Horários Manhã (8h-12h)
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      const horariosTarde = [
                        { horaInicio: '13:00', horaFim: '14:00' },
                        { horaInicio: '14:00', horaFim: '15:00' },
                        { horaInicio: '15:00', horaFim: '16:00' },
                        { horaInicio: '16:00', horaFim: '17:00' }
                      ];
                      const novosHorarios: Horario[] = horariosTarde.map(h => ({
                        diaSemana: novoHorario.diaSemana as 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado',
                        horaInicio: h.horaInicio,
                        horaFim: h.horaFim,
                        vagas: novoHorario.vagas || 20,
                        alunosMatriculados: []
                      }));
                      setFormData({
                        ...formData,
                        horarios: [...(formData.horarios || []), ...novosHorarios]
                      });
                    }}
                    className={styles.botaoAtalho}
                  >
                    + Horários Tarde (13h-17h)
                  </button>
                </div>
              </div>
              
              {/* Adicionar horário manual */}
              <details className={styles.horarioManual}>
                <summary>Adicionar horário personalizado</summary>
                <div className={styles.horariosGrid}>
                  <input
                    type="time"
                    value={novoHorario.horaInicio}
                    onChange={(e) => setNovoHorario({ ...novoHorario, horaInicio: e.target.value })}
                    placeholder="Início"
                  />
                  <input
                    type="time"
                    value={novoHorario.horaFim}
                    onChange={(e) => setNovoHorario({ ...novoHorario, horaFim: e.target.value })}
                    placeholder="Fim"
                  />
                  <button type="button" onClick={adicionarHorario} className={styles.botaoAdicionar}>
                    Adicionar
                  </button>
                </div>
              </details>

              {formData.horarios && formData.horarios.length > 0 && (
                <div className={styles.listaHorarios}>
                  <h5>Horários Cadastrados ({formData.horarios.length}):</h5>
                  {formData.horarios.map((horario, index) => (
                    <div key={index} className={styles.horarioItem}>
                      <span>
                        {horario.diaSemana.charAt(0).toUpperCase() + horario.diaSemana.slice(1)} -{' '}
                        {horario.horaInicio} às {horario.horaFim} ({horario.vagas} vagas)
                      </span>
                      <button type="button" onClick={() => removerHorario(index)} className={styles.botaoRemover}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Materiais */}
            <div className={styles.secao}>
              <h4>Materiais Necessários</h4>
              <button type="button" onClick={adicionarMaterial} className={styles.botaoAdicionar}>
                Adicionar Material
              </button>
              {formData.materiais && formData.materiais.length > 0 && (
                <ul className={styles.listaMateriais}>
                  {formData.materiais.map((material, index) => (
                    <li key={index}>
                      {material}
                      <button type="button" onClick={() => removerMaterial(index)} className={styles.botaoRemover}>
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.botoes}>
              <button type="submit" disabled={loading} className={styles.botaoSalvar}>
                {loading ? 'Salvando...' : modoEdicao ? 'Atualizar' : 'Criar Oficina'}
              </button>
              {modoEdicao && (
                <button type="button" onClick={limparFormulario} className={styles.botaoCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Oficinas */}
        <div className={styles.lista}>
          <h3>Oficinas Cadastradas</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : oficinas.length === 0 ? (
            <p>Nenhuma oficina cadastrada</p>
          ) : (
            <div className={styles.listaOficinas}>
              {oficinas.map((oficina) => (
                <div key={oficina.id} className={styles.oficinaCard}>
                  <div className={styles.oficinaHeader}>
                    <h4>{oficina.nome}</h4>
                    <span className={`${styles.status} ${styles[oficina.status]}`}>
                      {oficina.status}
                    </span>
                  </div>
                  <p className={styles.categoria}>{oficina.categoria}</p>
                  <p>{oficina.descricao}</p>
                  <div className={styles.oficinaInfo}>
                    <span>Vagas: {oficina.vagasDisponiveis}/{oficina.vagasTotais}</span>
                    <span>Horários: {oficina.horarios.length}</span>
                  </div>
                  {oficina.responsavel && (
                    <p className={styles.responsavel}>
                      Responsável: {oficina.responsavel.nome}
                    </p>
                  )}
                  <div className={styles.acoes}>
                    {onVisualizarOficina && (
                      <button onClick={() => onVisualizarOficina(oficina.id)} className={styles.botaoVisualizar}>
                        👁️ Visualizar
                      </button>
                    )}
                    <button onClick={() => handleEditar(oficina)} className={styles.botaoEditar}>
                      Editar
                    </button>
                    <button onClick={() => handleExcluir(oficina.id)} className={styles.botaoExcluir}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
