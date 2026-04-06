import React, { useState, useEffect } from 'react';
import { AgentesCidadania, Oficina } from '../types';
import { oficinaService, agentesCidadaniaService } from '../services/oficinaService';
import styles from '../styles/VisualizadorOficinasAgente.module.css';

interface VisualizadorOficinasAgenteProps {
  agente: AgentesCidadania;
  onFechar: () => void;
  onAtualizar: () => void;
}

export default function VisualizadorOficinasAgente({ 
  agente, 
  onFechar, 
  onAtualizar 
}: VisualizadorOficinasAgenteProps) {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [oficinasAgente, setOficinasAgente] = useState<Oficina[]>([]);
  const [oficinasDisponiveis, setOficinasDisponiveis] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarAdicionar, setMostrarAdicionar] = useState(false);

  useEffect(() => {
    carregarOficinas();
  }, [agente]);

  const carregarOficinas = async () => {
    setLoading(true);
    try {
      const todasOficinas = await oficinaService.listar();
      setOficinas(todasOficinas);

      // Oficinas atuais do agente
      const oficinaIdsAgente = [
        ...(agente.oficinaId ? [agente.oficinaId] : []),
        ...(agente.oficinasIds || [])
      ];

      const oficinasFiltradas = todasOficinas.filter(of => 
        oficinaIdsAgente.includes(of.id)
      );
      setOficinasAgente(oficinasFiltradas);

      // Oficinas disponíveis (ativas ou planejadas, não vinculadas ao agente)
      const disponiveis = todasOficinas.filter(of => 
        (of.status === 'ativa' || of.status === 'planejada') && 
        !oficinaIdsAgente.includes(of.id)
      );
      setOficinasDisponiveis(disponiveis);
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarOficina = async (oficinaId: string) => {
    setLoading(true);
    try {
      // Adicionar oficina usando o endpoint específico do backend
      await agentesCidadaniaService.adicionarOficina(agente.id, oficinaId);

      alert('Oficina vinculada com sucesso!');
      setMostrarAdicionar(false);
      
      // Buscar o agente atualizado do backend
      const agenteAtualizado = await agentesCidadaniaService.buscarPorId(agente.id);
      if (agenteAtualizado) {
        // Atualizar o agente local com os novos dados
        Object.assign(agente, agenteAtualizado);
      }
      
      onAtualizar();
      await carregarOficinas();
    } catch (error) {
      console.error('Erro ao adicionar oficina:', error);
      alert('Erro ao vincular oficina');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverOficina = async (oficinaId: string) => {
    if (!confirm('Deseja remover o agente desta oficina?')) return;

    setLoading(true);
    try {
      const novasOficinasIds = (agente.oficinasIds || []).filter(id => id !== oficinaId);

      // Se for a oficina principal, limpar também
      const updates: any = { oficinasIds: novasOficinasIds };
      if (agente.oficinaId === oficinaId) {
        updates.oficinaId = undefined;
      }

      // Atualizar no backend
      await agentesCidadaniaService.atualizar(agente.id, updates);

      alert('Agente removido da oficina com sucesso!');
      
      // Buscar o agente atualizado do backend
      const agenteAtualizado = await agentesCidadaniaService.buscarPorId(agente.id);
      if (agenteAtualizado) {
        Object.assign(agente, agenteAtualizado);
      }
      
      onAtualizar();
      await carregarOficinas();
    } catch (error) {
      console.error('Erro ao remover oficina:', error);
      alert('Erro ao remover da oficina');
    } finally {
      setLoading(false);
    }
  };

  const handleDefinirPrincipal = async (oficinaId: string) => {
    setLoading(true);
    try {
      // Atualizar no backend
      await agentesCidadaniaService.atualizar(agente.id, {
        oficinaId: oficinaId
      });

      alert('Oficina principal definida com sucesso!');
      
      // Buscar o agente atualizado do backend
      const agenteAtualizado = await agentesCidadaniaService.buscarPorId(agente.id);
      if (agenteAtualizado) {
        Object.assign(agente, agenteAtualizado);
      }
      
      onAtualizar();
      await carregarOficinas();
    } catch (error) {
      console.error('Erro ao definir oficina principal:', error);
      alert('Erro ao definir oficina principal');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const categorias: Record<string, string> = {
      'esporte': '⚽ Esporte',
      'arte': '🎨 Arte',
      'musica': '🎵 Música',
      'danca': '💃 Dança',
      'artesanato': '✂️ Artesanato',
      'informatica': '💻 Informática',
      'idiomas': '🗣️ Idiomas',
      'outras': '📚 Outras'
    };
    return categorias[categoria] || categoria;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'ativa': { label: 'Ativa', color: '#10b981' },
      'planejada': { label: 'Planejada', color: '#f59e0b' },
      'suspensa': { label: 'Suspensa', color: '#ef4444' },
      'encerrada': { label: 'Encerrada', color: '#6b7280' }
    };
    return statusMap[status] || { label: status, color: '#6b7280' };
  };

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>🎯 Oficinas do Agente</h2>
            <div className={styles.agenteInfo}>
              <h3>{agente.nome}</h3>
              <p>CPF: {agente.cpf}</p>
            </div>
          </div>
          <button onClick={onFechar} className={styles.btnFechar}>
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className={styles.conteudo}>
          {loading ? (
            <div className={styles.loading}>
              <p>⏳ Carregando oficinas...</p>
            </div>
          ) : (
            <>
              {/* Oficinas vinculadas */}
              <div className={styles.secao}>
                <div className={styles.secaoHeader}>
                  <h3>Oficinas Vinculadas ({oficinasAgente.length})</h3>
                  <button 
                    onClick={() => setMostrarAdicionar(!mostrarAdicionar)}
                    className={styles.btnAdicionar}
                  >
                    {mostrarAdicionar ? '− Cancelar' : '+ Adicionar Oficina'}
                  </button>
                </div>

                {mostrarAdicionar && (
                  <div className={styles.adicionarBox}>
                    <h4>Selecione uma oficina para vincular:</h4>
                    {oficinasDisponiveis.length === 0 ? (
                      <p className={styles.emptyText}>
                        Não há oficinas disponíveis para vincular
                      </p>
                    ) : (
                      <div className={styles.oficinasList}>
                        {oficinasDisponiveis.map(oficina => (
                          <div key={oficina.id} className={styles.oficinaItem}>
                            <div className={styles.oficinaItemInfo}>
                              <strong>{oficina.nome}</strong>
                              <span className={styles.categoria}>
                                {getCategoriaLabel(oficina.categoria)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAdicionarOficina(oficina.id)}
                              className={styles.btnVincular}
                              disabled={loading}
                            >
                              Vincular
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {oficinasAgente.length === 0 ? (
                  <div className={styles.empty}>
                    <p>📋 Este agente ainda não está vinculado a nenhuma oficina</p>
                    <small>Clique em "Adicionar Oficina" para vincular</small>
                  </div>
                ) : (
                  <div className={styles.oficinasGrid}>
                    {oficinasAgente.map(oficina => {
                      const statusInfo = getStatusLabel(oficina.status);
                      const ehPrincipal = agente.oficinaId === oficina.id;

                      return (
                        <div key={oficina.id} className={styles.oficinaCard}>
                          {ehPrincipal && (
                            <div className={styles.badgePrincipal}>⭐ Principal</div>
                          )}
                          
                          <div className={styles.oficinaCardHeader}>
                            <h4>{oficina.nome}</h4>
                            <span 
                              className={styles.status}
                              style={{ backgroundColor: statusInfo.color }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className={styles.descricao}>{oficina.descricao}</p>

                          <div className={styles.oficinaInfo}>
                            <div className={styles.infoItem}>
                              <span className={styles.label}>Categoria:</span>
                              <span>{getCategoriaLabel(oficina.categoria)}</span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.label}>Responsável:</span>
                              <span>{oficina.responsavel?.nome || 'Não definido'}</span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.label}>Vagas:</span>
                              <span>{oficina.vagasDisponiveis}/{oficina.vagasTotais}</span>
                            </div>
                            {oficina.local && (
                              <div className={styles.infoItem}>
                                <span className={styles.label}>Local:</span>
                                <span>{oficina.local}</span>
                              </div>
                            )}
                          </div>

                          <div className={styles.oficinaAcoes}>
                            {!ehPrincipal && (
                              <button
                                onClick={() => handleDefinirPrincipal(oficina.id)}
                                className={styles.btnPrincipal}
                                disabled={loading}
                              >
                                ⭐ Definir como Principal
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoverOficina(oficina.id)}
                              className={styles.btnRemover}
                              disabled={loading}
                            >
                              🗑️ Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
