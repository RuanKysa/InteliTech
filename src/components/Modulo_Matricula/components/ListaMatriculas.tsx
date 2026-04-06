import React, { useState, useEffect } from 'react';
import { Matricula, FiltrosMatricula } from '../types';
import styles from '../styles/Matricula.module.css';

interface ListaMatriculasProps {
  matriculas: Matricula[];
  onEditar: (matricula: Matricula) => void;
  onVisualizar: (matricula: Matricula) => void;
  onExcluir: (id: string) => void;
  onNovaMatricula: () => void;
  onImprimirDeclaracao: (matricula: Matricula) => void;
  onAnexarDeclaracao: (matricula: Matricula) => void;
  onImprimirRenovacao: (matricula: Matricula) => void;
  onAnexarRenovacao: (matricula: Matricula) => void;
  onImprimirFichaNatacao: (matricula: Matricula) => void;
  onAnexarFichaNatacao: (matricula: Matricula) => void;
  onImprimirDesistencia: (matricula: Matricula) => void;
  onAnexarDesistencia: (matricula: Matricula) => void;
  onVisualizarAnexos: (matricula: Matricula) => void;
}

export default function ListaMatriculas({
  matriculas,
  onEditar,
  onVisualizar,
  onExcluir,
  onNovaMatricula,
  onImprimirDeclaracao,
  onAnexarDeclaracao,
  onImprimirRenovacao,
  onAnexarRenovacao,
  onImprimirFichaNatacao,
  onAnexarFichaNatacao,
  onImprimirDesistencia,
  onAnexarDesistencia,
  onVisualizarAnexos
}: ListaMatriculasProps) {
  const [filtros, setFiltros] = useState<FiltrosMatricula>({
    busca: '',
    dataInicio: '',
    dataFim: '',
  });
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuAberto && !target.closest(`.${styles.menuDropdown}`)) {
        setMenuAberto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAberto]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const matriculasFiltradas = matriculas.filter(matricula => {
    // Filtro por busca (nome, CPF ou responsável)
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const nomeMatch = matricula.nomeCompleto.toLowerCase().includes(busca);
      const cpfMatch = matricula.cpf.includes(busca);
      const responsavelMatch = matricula.nomeResponsavel.toLowerCase().includes(busca);
      if (!nomeMatch && !cpfMatch && !responsavelMatch) {
        return false;
      }
    }

    // Filtro por data
    if (filtros.dataInicio) {
      const dataMatricula = new Date(matricula.dataCadastro);
      const dataInicio = new Date(filtros.dataInicio);
      if (dataMatricula < dataInicio) {
        return false;
      }
    }

    if (filtros.dataFim) {
      const dataMatricula = new Date(matricula.dataCadastro);
      const dataFim = new Date(filtros.dataFim);
      if (dataMatricula > dataFim) {
        return false;
      }
    }

    return true;
  });

  const formatarData = (data: Date | string) => {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  };

  const handleConfirmarExclusao = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a matrícula de ${nome}?`)) {
      onExcluir(id);
    }
  };

  const toggleMenu = (matriculaId: string) => {
    setMenuAberto(menuAberto === matriculaId ? null : matriculaId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Matrículas</h1>
          <p>Gerencie e acompanhe as matrículas cadastradas no sistema</p>
        </div>
        <button
          onClick={onNovaMatricula}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          Nova Matrícula
        </button>
      </div>

      <div className={styles.lista}>
        {/* Seção de Filtros e Estatísticas */}
        <div className={styles.filtrosContainer}>
          <div className={styles.filtrosHeader}>
            <h3 className={styles.filtrosTitle}>Filtros</h3>
            {(filtros.busca || filtros.dataInicio || filtros.dataFim) && (
              <button 
                onClick={() => setFiltros({ busca: '', dataInicio: '', dataFim: '' })}
                className={styles.buttonLimparFiltros}
              >
                Limpar Filtros
              </button>
            )}
          </div>

          <div className={styles.filtros}>
            <div className={styles.filtroItem}>
              <label className={styles.filtroLabel}>🔍 Buscar</label>
              <input
                type="text"
                name="busca"
                value={filtros.busca}
                onChange={handleFiltroChange}
                className={styles.input}
                placeholder="Nome, CPF ou Responsável"
              />
            </div>

            <div className={styles.filtroItem}>
              <label className={styles.filtroLabel}>📅 Data Início</label>
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
                className={styles.input}
              />
            </div>

            <div className={styles.filtroItem}>
              <label className={styles.filtroLabel}>📅 Data Fim</label>
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className={styles.estatisticasWrapper}>
          <div className={styles.estatisticas}>
            <div className={styles.estatisticaCard}>
              <div className={styles.estatisticaInfo}>
                <div className={styles.estatisticaNumero}>{matriculas.length}</div>
                <div className={styles.estatisticaLabel}>Total de Matrículas</div>
              </div>
            </div>
            <div className={styles.estatisticaCard}>
              <div className={styles.estatisticaInfo}>
                <div className={styles.estatisticaNumero}>{matriculasFiltradas.length}</div>
                <div className={styles.estatisticaLabel}>Resultados Filtrados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Matrículas */}
        {matriculasFiltradas.length > 0 ? (
          <>
            {/* Cabeçalho da Tabela */}
            <div className={styles.tabelaHeader}>
              <div className={styles.colNome}>Nome / CPF</div>
              <div className={styles.colData}>Matrícula</div>
              <div className={styles.colData}>Nascimento</div>
              <div className={styles.colIdade}>Idade</div>
              <div className={styles.colResponsavel}>Responsável</div>
              <div className={styles.colTelefone}>Telefone_Responsável</div>
              <div className={styles.colAcoes}>Ações</div>
            </div>

            {/* Linhas da Tabela */}
            <div className={styles.matriculasGrid}>
              {matriculasFiltradas.map(matricula => {
                const calcularIdadeCompleta = (dataNasc: string) => {
                  const hoje = new Date();
                  const nascimento = new Date(dataNasc);
                  
                  let anos = hoje.getFullYear() - nascimento.getFullYear();
                  let meses = hoje.getMonth() - nascimento.getMonth();
                  let dias = hoje.getDate() - nascimento.getDate();
                  
                  // Ajustar dias negativos
                  if (dias < 0) {
                    meses--;
                    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
                    dias += ultimoDiaMesAnterior;
                  }
                  
                  // Ajustar meses negativos
                  if (meses < 0) {
                    anos--;
                    meses += 12;
                  }
                  
                  // Construir o texto da idade
                  const partes = [];
                  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
                  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
                  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
                  
                  return partes.length > 0 ? partes.join(', ') : '0 dias';
                };

                return (
                  <div key={matricula.id} className={styles.matriculaCard}>
                    <div className={styles.colNome}>
                      <div className={styles.nomeCompleto}>{matricula.nomeCompleto}</div>
                      <div className={styles.cpfTexto}>{matricula.cpf}</div>
                    </div>
                    <div className={styles.colData}>{formatarData(matricula.dataCadastro)}</div>
                    <div className={styles.colData}>{formatarData(matricula.dataNascimento)}</div>
                    <div className={styles.colIdade}>{calcularIdadeCompleta(matricula.dataNascimento)}</div>
                    <div className={styles.colResponsavel}>{matricula.nomeResponsavel}</div>
                    <div className={styles.colTelefone}>{matricula.telefone}</div>
                    <div className={styles.colAcoes}>
                      <button
                        onClick={() => onVisualizar(matricula)}
                        className={styles.acaoButtonPrimary}
                        title="Visualizar matrícula"
                      >
                        Visualizar
                      </button>
                      <div className={styles.menuDropdown}>
                        <button
                          className={`${styles.menuDropdownButton} ${menuAberto === matricula.id ? styles.menuDropdownButtonActive : ''}`}
                          onClick={() => toggleMenu(matricula.id!)}
                        >
                          ⋮
                        </button>
                        {menuAberto === matricula.id && (
                          <div className={styles.menuDropdownContent}>
                            <button onClick={() => {
                              onEditar(matricula);
                              setMenuAberto(null);
                            }}>
                              Editar
                            </button>
                            <button onClick={() => {
                              onVisualizarAnexos(matricula);
                              setMenuAberto(null);
                            }}>
                              📎 Ver Anexos
                            </button>
                            <button
                              onClick={() => {
                                handleConfirmarExclusao(matricula.id!, matricula.nomeCompleto);
                                setMenuAberto(null);
                              }}
                              className={styles.menuItemDanger}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#4a5568'
          }}>
            <h3 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Nenhuma matrícula encontrada</h3>
            <p style={{ color: '#4a5568' }}>Não há matrículas cadastradas com os filtros selecionados.</p>
            <button
              onClick={onNovaMatricula}
              className={`${styles.button} ${styles.buttonPrimary}`}
              style={{ marginTop: '20px' }}
            >
              Cadastrar Nova Matrícula
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
