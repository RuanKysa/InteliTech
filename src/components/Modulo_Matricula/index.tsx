import React, { useState, useEffect } from 'react';
import { Matricula, DocumentoAnexo } from './types';
import ListaMatriculas from './components/ListaMatriculas';
import FormularioMatricula from './components/FormularioMatricula';
import DeclaracaoMatricula from './documentos/declaracao/DeclaracaoMatricula';
import AnexarDeclaracao from './documentos/declaracao/AnexarDeclaracao';
import RenovacaoMatricula from './documentos/renovacao/RenovacaoMatricula';
import AnexarRenovacao from './documentos/renovacao/AnexarRenovacao';
import FichaNatacao from './documentos/natacao/FichaNatacao';
import AnexarFichaNatacao from './documentos/natacao/AnexarFichaNatacao';
import SolicitacaoDesistencia from './documentos/desistencia/SolicitacaoDesistencia';
import AnexarDesistencia from './documentos/desistencia/AnexarDesistencia';
import VisualizadorDocumento from './components/VisualizadorDocumento';
import VisualizarAnexos from './components/VisualizarAnexos';
import { matriculasExemplo } from './utils/dadosExemplo';
import { matriculaService } from '@/services/matriculaService';
import styles from './styles/ModuloMatriculaIndex.module.css';

// Função helper para calcular idade completa
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

type Visualizacao = 'lista' | 'formulario' | 'visualizar' | 'visualizar_anexos' | 'declaracao' | 'anexar_declaracao' | 'renovacao' | 'anexar_renovacao' | 'ficha_natacao' | 'anexar_ficha_natacao' | 'desistencia' | 'anexar_desistencia';

export default function ModuloMatricula() {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('lista');
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<Matricula | undefined>();
  const [documentoAberto, setDocumentoAberto] = useState<DocumentoAnexo | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar matrículas do backend ao iniciar
  useEffect(() => {
    carregarMatriculas();
  }, []);

  const carregarMatriculas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await matriculaService.listar();
      setMatriculas(dados);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
      setErro('Erro ao carregar matrículas do servidor. Usando dados locais.');
      // Fallback: usar localStorage ou dados de exemplo
      const matriculasSalvas = localStorage.getItem('matriculas');
      if (matriculasSalvas) {
        try {
          setMatriculas(JSON.parse(matriculasSalvas));
        } catch {
          setMatriculas(matriculasExemplo);
        }
      } else {
        setMatriculas(matriculasExemplo);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNovaMatricula = () => {
    setMatriculaSelecionada(undefined);
    setVisualizacao('formulario');
  };

  const handleEditarMatricula = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('formulario');
  };

  const handleVisualizarMatricula = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('visualizar');
  };

  const handleImprimirDeclaracao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('declaracao');
  };

  const handleAnexarDeclaracao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('anexar_declaracao');
  };

  const handleImprimirRenovacao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('renovacao');
  };

  const handleAnexarRenovacao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('anexar_renovacao');
  };

  const handleImprimirFichaNatacao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('ficha_natacao');
  };

  const handleAnexarFichaNatacao = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('anexar_ficha_natacao');
  };

  const handleImprimirDesistencia = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('desistencia');
  };

  const handleAnexarDesistencia = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('anexar_desistencia');
  };

  const handleVisualizarAnexos = (matricula: Matricula) => {
    setMatriculaSelecionada(matricula);
    setVisualizacao('visualizar_anexos');
  };

  const handleSalvarMatricula = async (matricula: Matricula) => {
    setLoading(true);
    setErro(null);
    
    try {
      if (matricula.id) {
        // Editar matrícula existente
        const matriculaAtualizada = await matriculaService.atualizar(matricula.id, matricula);
        setMatriculas(prev =>
          prev.map(m => m.id === matricula.id ? matriculaAtualizada : m)
        );
        alert('Matrícula atualizada com sucesso!');
      } else {
        // Nova matrícula
        const novaMatricula = {
          ...matricula,
          dataCadastro: new Date(),
        };
        const matriculaCriada = await matriculaService.criar(novaMatricula);
        setMatriculas(prev => [...prev, matriculaCriada]);
        alert('Matrícula cadastrada com sucesso!');
      }
      setVisualizacao('lista');
      setMatriculaSelecionada(undefined);
    } catch (error) {
      console.error('Erro ao salvar matrícula:', error);
      setErro('Erro ao salvar matrícula. Por favor, tente novamente.');
      alert('Erro ao salvar matrícula. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirMatricula = async (id: string) => {
    setLoading(true);
    setErro(null);
    
    try {
      await matriculaService.excluir(id);
      setMatriculas(prev => prev.filter(m => m.id !== id));
      alert('Matrícula excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      setErro('Erro ao excluir matrícula. Por favor, tente novamente.');
      alert('Erro ao excluir matrícula. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setVisualizacao('lista');
    setMatriculaSelecionada(undefined);
  };

  const handleVoltarParaVisualizacao = () => {
    setVisualizacao('visualizar');
  };

  return (
    <div>
      {visualizacao === 'lista' && (
        <ListaMatriculas
          matriculas={matriculas}
          onEditar={handleEditarMatricula}
          onVisualizar={handleVisualizarMatricula}
          onExcluir={handleExcluirMatricula}
          onNovaMatricula={handleNovaMatricula}
          onImprimirDeclaracao={handleImprimirDeclaracao}
          onAnexarDeclaracao={handleAnexarDeclaracao}
          onImprimirRenovacao={handleImprimirRenovacao}
          onAnexarRenovacao={handleAnexarRenovacao}
          onImprimirFichaNatacao={handleImprimirFichaNatacao}
          onAnexarFichaNatacao={handleAnexarFichaNatacao}
          onImprimirDesistencia={handleImprimirDesistencia}
          onAnexarDesistencia={handleAnexarDesistencia}
          onVisualizarAnexos={handleVisualizarAnexos}
        />
      )}

      {visualizacao === 'formulario' && (
        <FormularioMatricula
          matriculaInicial={matriculaSelecionada}
          onSalvar={handleSalvarMatricula}
          onCancelar={handleCancelar}
        />
      )}

      {visualizacao === 'visualizar' && matriculaSelecionada && (
        <div className={styles.visualizacaoContainer}>
          <div className={styles.visualizacaoContent}>
            {/* Cabeçalho com botão voltar */}
            <div className={styles.visualizacaoHeader}>
              <button
                onClick={handleCancelar}
                className={styles.buttonVoltar}
              >
                ← Voltar para Lista
              </button>
              <div className={styles.headerInfo}>
                <h1 className={styles.visualizacaoTitle}>Visualização de Matrícula</h1>
                <div className={styles.matriculaInfo}>
                  <span className={styles.matriculaNumero}>Nº {matriculaSelecionada.id}</span>
                  <span className={styles.matriculaNome}>{matriculaSelecionada.nomeCompleto}</span>
                </div>
              </div>
            </div>

            {/* Layout com sidebar de ações */}
            <div className={styles.visualizacaoLayout}>
              {/* Sidebar de Ações */}
              <aside className={styles.actionsSidebar}>
                <div className={styles.actionsGroup}>
                  <h3 className={styles.actionsGroupTitle}>Documentos de Matrícula</h3>
                  <button
                    onClick={() => handleImprimirDeclaracao(matriculaSelecionada)}
                    className={styles.actionButton}
                  >
                    <span className={styles.actionText}>Declaração de Matrícula</span>
                  </button>
                  <button
                    onClick={() => handleAnexarDeclaracao(matriculaSelecionada)}
                    className={styles.actionButtonSecondary}
                  >
                    Anexar Declaração Assinada
                  </button>
                </div>

                <div className={styles.actionsGroup}>
                  <h3 className={styles.actionsGroupTitle}>Renovação</h3>
                  <button
                    onClick={() => handleImprimirRenovacao(matriculaSelecionada)}
                    className={styles.actionButton}
                  >
                    <span className={styles.actionText}>Renovação de Matrícula</span>
                  </button>
                  <button
                    onClick={() => handleAnexarRenovacao(matriculaSelecionada)}
                    className={styles.actionButtonSecondary}
                  >
                    Anexar Renovação Assinada
                  </button>
                </div>

                <div className={styles.actionsGroup}>
                  <h3 className={styles.actionsGroupTitle}>Natação</h3>
                  <button
                    onClick={() => handleImprimirFichaNatacao(matriculaSelecionada)}
                    className={styles.actionButton}
                  >
                    <span className={styles.actionText}>Ficha de Natação</span>
                  </button>
                  <button
                    onClick={() => handleAnexarFichaNatacao(matriculaSelecionada)}
                    className={styles.actionButtonSecondary}
                  >
                    Anexar Ficha Assinada
                  </button>
                </div>

                <div className={styles.actionsGroup}>
                  <h3 className={styles.actionsGroupTitle}>Desistência</h3>
                  <button
                    onClick={() => handleImprimirDesistencia(matriculaSelecionada)}
                    className={styles.actionButton}
                  >
                    <span className={styles.actionText}>Solicitação de Desistência</span>
                  </button>
                  <button
                    onClick={() => handleAnexarDesistencia(matriculaSelecionada)}
                    className={styles.actionButtonSecondary}
                  >
                    Anexar Desistência Assinada
                  </button>
                </div>
              </aside>

              {/* Conteúdo principal */}
              <div className={styles.mainContent}>
                <div className={styles.dadosGrid}>
              {/* Dados Pessoais */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Dados Pessoais
                </h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <strong className={styles.fieldLabel}>Nome Completo:</strong>
                    <p className={styles.fieldValue}>{matriculaSelecionada.nomeCompleto}</p>
                  </div>
                  <div className={styles.field}>
                    <strong className={styles.fieldLabel}>Data de Nascimento:</strong>
                    <p className={styles.fieldValue}>
                      {new Date(matriculaSelecionada.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className={styles.field}>
                    <strong className={styles.fieldLabel}>Idade:</strong>
                    <p className={styles.fieldValue}>{calcularIdadeCompleta(matriculaSelecionada.dataNascimento)}</p>
                  </div>
                  <div className={styles.field}>
                    <strong className={styles.fieldLabel}>CPF:</strong>
                    <p className={styles.fieldValue}>{matriculaSelecionada.cpf}</p>
                  </div>
                  <div className={styles.field}>
                    <strong className={styles.fieldLabel}>RG:</strong>
                    <p className={styles.fieldValue}>{matriculaSelecionada.rg} - {matriculaSelecionada.rgUF}</p>
                  </div>
                  {matriculaSelecionada.turnoSCFV && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Turno SCFV:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.turnoSCFV}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* CAD ÚNICO e Programas Sociais */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  CAD ÚNICO e Programas Sociais
                </h2>
                <div className={styles.fieldsGrid}>
                  {matriculaSelecionada.cadUnicoAluno && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>CAD ÚNICO (Aluno):</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.cadUnicoAluno}</p>
                    </div>
                  )}
                  {matriculaSelecionada.cadUnicoResponsavel && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>CAD ÚNICO (Responsável):</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.cadUnicoResponsavel}</p>
                    </div>
                  )}
                  {matriculaSelecionada.programaSocial && matriculaSelecionada.programaSocial !== 'nao_possui' && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Programa Social:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.programaSocial}</p>
                    </div>
                  )}
                  {matriculaSelecionada.quantasPessoasResidencia > 0 && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Pessoas na Residência:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.quantasPessoasResidencia}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Filiação */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Filiação
                </h2>
                <div className={styles.fieldsGridLarge}>
                  {matriculaSelecionada.nomeMae && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Mãe:</strong>
                      <p className={styles.fieldValue}>
                        {matriculaSelecionada.nomeMae}
                        {matriculaSelecionada.rgMae && ` - RG: ${matriculaSelecionada.rgMae}/${matriculaSelecionada.ufMae}`}
                      </p>
                    </div>
                  )}
                  {matriculaSelecionada.nomePai && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Pai:</strong>
                      <p className={styles.fieldValue}>
                        {matriculaSelecionada.nomePai}
                        {matriculaSelecionada.rgPai && ` - RG: ${matriculaSelecionada.rgPai}/${matriculaSelecionada.ufPai}`}
                      </p>
                    </div>
                  )}
                  {matriculaSelecionada.nomeResponsavel && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Responsável:</strong>
                      <p className={styles.fieldValue}>
                        {matriculaSelecionada.nomeResponsavel}
                        {matriculaSelecionada.parentesco && ` (${matriculaSelecionada.parentesco})`}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Contato */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Contato
                </h2>
                <div className={styles.fieldsGrid}>
                  {matriculaSelecionada.telefone && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Telefone:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.telefone}</p>
                    </div>
                  )}
                  {matriculaSelecionada.telefoneOutro && (
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Telefone (outro):</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.telefoneOutro}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Endereço */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Endereço
                </h2>
                <p className={styles.fieldText}>
                  {matriculaSelecionada.endereco}, {matriculaSelecionada.numeroEndereco}
                  {matriculaSelecionada.complemento && ` - ${matriculaSelecionada.complemento}`}
                  <br />
                  {matriculaSelecionada.bairro}
                  {matriculaSelecionada.municipio && ` - ${matriculaSelecionada.municipio}`}
                  {matriculaSelecionada.uf && `/${matriculaSelecionada.uf}`}
                  {matriculaSelecionada.postoDeSaude && (
                    <>
                      <br />
                      Posto de Saúde: {matriculaSelecionada.postoDeSaude}
                    </>
                  )}
                </p>
              </section>

              {/* Informações Escolares */}
              {(matriculaSelecionada.escola || matriculaSelecionada.serie || matriculaSelecionada.turno) && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Informações Escolares
                  </h2>
                  <div className={styles.fieldsGrid}>
                    {matriculaSelecionada.escola && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Escola:</strong>
                        <p className={styles.fieldValue}>{matriculaSelecionada.escola}</p>
                      </div>
                    )}
                    {matriculaSelecionada.serie && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Série:</strong>
                        <p className={styles.fieldValue}>{matriculaSelecionada.serie}</p>
                      </div>
                    )}
                    {matriculaSelecionada.turno && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Turno:</strong>
                        <p className={styles.fieldValue}>{matriculaSelecionada.turno}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* PCD */}
              {matriculaSelecionada.possuiDeficiencia && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Pessoa com Deficiência (PCD)
                  </h2>
                  <div className={styles.fieldsGrid}>
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Tipo de Deficiência:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.tipoDeficiencia}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Informações de Saúde */}
              {matriculaSelecionada.usaRemediosControlados && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Informações de Saúde
                  </h2>
                  <div className={styles.fieldsGrid}>
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Usa Remédios Controlados:</strong>
                      <p className={styles.fieldValue}>Sim</p>
                    </div>
                    {matriculaSelecionada.observacaoRemedios && (
                      <div className={`${styles.field} ${styles.fieldFull}`}>
                        <strong className={styles.fieldLabel}>Remédio(s) e Dosagem:</strong>
                        <p className={styles.fieldTextPreWrap}>{matriculaSelecionada.observacaoRemedios}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Transporte e Alimentação */}
              {(matriculaSelecionada.utilizaTransporte || matriculaSelecionada.almoco) && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Transporte e Alimentação
                  </h2>
                  <div className={styles.fieldsGrid}>
                    {matriculaSelecionada.utilizaTransporte && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Transporte:</strong>
                        <p className={styles.fieldValue}>
                          Embarque: {matriculaSelecionada.localEmbarque}<br />
                          Desembarque: {matriculaSelecionada.localDesembarque}
                        </p>
                      </div>
                    )}
                    {matriculaSelecionada.almoco && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Almoço:</strong>
                        <p className={styles.fieldValue}>Sim</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Encaminhamento */}
              {matriculaSelecionada.encaminhadoPor && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Encaminhamento
                  </h2>
                  <div className={styles.fieldsGrid}>
                    <div className={styles.field}>
                      <strong className={styles.fieldLabel}>Encaminhado por:</strong>
                      <p className={styles.fieldValue}>{matriculaSelecionada.encaminhadoPor}</p>
                    </div>
                    {matriculaSelecionada.dataEncaminhamento && (
                      <div className={styles.field}>
                        <strong className={styles.fieldLabel}>Data:</strong>
                        <p className={styles.fieldValue}>
                          {new Date(matriculaSelecionada.dataEncaminhamento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Observações */}
              {matriculaSelecionada.observacoes && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Observações
                  </h2>
                  <p className={styles.fieldTextPreWrap}>
                    {matriculaSelecionada.observacoes}
                  </p>
                </section>
              )}

              {/* Status da Declaração */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Declaração de Matrícula
                </h2>
                <div className={matriculaSelecionada.matriculaAssinada ? styles.statusDeclaracaoAssinada : styles.statusDeclaracaoPendente}>
                  <p className={styles.statusDeclaracao}>
                    {matriculaSelecionada.matriculaAssinada ? '✅ Declaração Assinada Anexada' : '⏳ Aguardando Declaração Assinada'}
                  </p>
                  {matriculaSelecionada.matriculaAssinada && (
                    <p className={`${styles.fieldValue} ${styles.statusDeclaracaoAssinada}`}>
                      Documento com assinatura do responsável já foi anexado ao sistema.
                    </p>
                  )}
                  {!matriculaSelecionada.matriculaAssinada && (
                    <p className={`${styles.fieldValue} ${styles.statusDeclaracaoPendente}`}>
                      Imprima a declaração, solicite a assinatura do responsável e anexe ao sistema.
                    </p>
                  )}
                </div>
              </section>

              {/* Documentos */}
              {matriculaSelecionada.documentos.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Documentos Anexados
                  </h2>
                  <div className={styles.documentosGrid}>
                    {matriculaSelecionada.documentos.map(doc => {
                      const getTipoLabel = (tipo: string) => {
                        const tipos: Record<string, string> = {
                          'rg': 'RG',
                          'cpf': 'CPF',
                          'comprovante_residencia': 'Comprovante de Residência',
                          'foto': 'Foto 3x4',
                          'certidao_nascimento': 'Certidão de Nascimento',
                          'declaracao_assinada': 'Declaração Assinada',
                          'outro': 'Outro'
                        };
                        return tipos[tipo] || tipo;
                      };

                      return (
                        <div
                          key={doc.id}
                          onClick={() => setDocumentoAberto(doc)}
                          className={styles.documentoCard}
                        >
                          <p className={styles.documentoTipo}>
                            {getTipoLabel(doc.tipo)}
                          </p>
                          <p className={styles.documentoNome}>
                            {doc.nomeArquivo}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {visualizacao === 'declaracao' && matriculaSelecionada && (
        <DeclaracaoMatricula
          matricula={matriculaSelecionada}
          onVoltar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'anexar_declaracao' && matriculaSelecionada && (
        <AnexarDeclaracao
          matricula={matriculaSelecionada}
          onSalvar={(matriculaAtualizada) => {
            handleSalvarMatricula(matriculaAtualizada);
            setVisualizacao('lista');
          }}
          onCancelar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'renovacao' && matriculaSelecionada && (
        <RenovacaoMatricula
          matricula={matriculaSelecionada}
          onVoltar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'anexar_renovacao' && matriculaSelecionada && (
        <AnexarRenovacao
          matricula={matriculaSelecionada}
          onSalvar={(matriculaAtualizada) => {
            handleSalvarMatricula(matriculaAtualizada);
            setVisualizacao('lista');
          }}
          onCancelar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'ficha_natacao' && matriculaSelecionada && (
        <FichaNatacao
          matricula={matriculaSelecionada}
          onVoltar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'anexar_ficha_natacao' && matriculaSelecionada && (
        <AnexarFichaNatacao
          matricula={matriculaSelecionada}
          onSalvar={(matriculaAtualizada) => {
            handleSalvarMatricula(matriculaAtualizada);
            setVisualizacao('lista');
          }}
          onCancelar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'desistencia' && matriculaSelecionada && (
        <SolicitacaoDesistencia
          matricula={matriculaSelecionada}
          onVoltar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'anexar_desistencia' && matriculaSelecionada && (
        <AnexarDesistencia
          matricula={matriculaSelecionada}
          onSalvar={(matriculaAtualizada) => {
            handleSalvarMatricula(matriculaAtualizada);
            setVisualizacao('lista');
          }}
          onCancelar={handleVoltarParaVisualizacao}
        />
      )}

      {visualizacao === 'visualizar_anexos' && matriculaSelecionada && (
        <VisualizarAnexos
          matricula={matriculaSelecionada}
          onVoltar={handleCancelar}
        />
      )}

      {/* Visualizador de Documentos */}
      {documentoAberto && (
        <VisualizadorDocumento
          documento={documentoAberto}
          onFechar={() => setDocumentoAberto(null)}
        />
      )}
    </div>
  );
}
