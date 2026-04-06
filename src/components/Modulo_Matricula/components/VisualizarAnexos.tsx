import React, { useState } from 'react';
import { Matricula, DocumentoAnexo } from '../types';
import VisualizadorDocumento from './VisualizadorDocumento';
import styles from '../styles/Matricula.module.css';

interface VisualizarAnexosProps {
  matricula: Matricula;
  onVoltar: () => void;
}

export default function VisualizarAnexos({ matricula, onVoltar }: VisualizarAnexosProps) {
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoAnexo | null>(null);

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'rg': 'RG',
      'cpf': 'CPF',
      'comprovante_residencia': 'Comprovante de Residência',
      'foto': 'Foto 3x4',
      'certidao_nascimento': 'Certidão de Nascimento',
      'declaracao_assinada': 'Declaração Assinada',
      'renovacao_assinada': 'Renovação Assinada',
      'ficha_natacao_assinada': 'Ficha de Natação Assinada',
      'desistencia_assinada': 'Solicitação de Desistência Assinada',
      'outro': 'Outro'
    };
    return tipos[tipo] || tipo;
  };

  const formatarData = (data: Date | string) => {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  };

  const getFileIcon = (nomeArquivo: string) => {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return '🖼️';
    } else if (ext === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(ext)) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(ext)) {
      return '📊';
    }
    return '📎';
  };

  const handleDownloadDocumento = (documento: DocumentoAnexo) => {
    if (documento.url) {
      const link = document.createElement('a');
      link.href = documento.url;
      link.download = documento.nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('URL do documento não disponível');
    }
  };

  // Agrupar documentos por tipo
  const documentosAgrupados: Record<string, DocumentoAnexo[]> = {};
  const documentosDeclaracoes: DocumentoAnexo[] = [];
  
  matricula.documentos.forEach(doc => {
    // Separar declarações assinadas
    if (['declaracao_assinada', 'renovacao_assinada', 'ficha_natacao_assinada', 'desistencia_assinada'].includes(doc.tipo)) {
      documentosDeclaracoes.push(doc);
    } else {
      if (!documentosAgrupados[doc.tipo]) {
        documentosAgrupados[doc.tipo] = [];
      }
      documentosAgrupados[doc.tipo].push(doc);
    }
  });

  const temDocumentos = matricula.documentos && matricula.documentos.length > 0;

  return (
    <div className={styles.containerVisualizacao}>
      {/* Barra de topo */}
      <div className={styles.topoVisualizacao}>
        <div>
          <h2>Anexos e Documentos</h2>
          <p className={styles.subtituloVisualizacao}>
            {matricula.nomeCompleto}
          </p>
        </div>
        <button
          onClick={onVoltar}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          ← Voltar
        </button>
      </div>

      {!temDocumentos ? (
        <div className={styles.semDocumentos}>
          <div className={styles.iconeSemDocumentos}>📋</div>
          <h3>Nenhum documento anexado</h3>
          <p>Esta matrícula ainda não possui documentos anexados.</p>
        </div>
      ) : (
        <div className={styles.documentosContainer}>
          {/* Seção de Declarações e Formulários Assinados */}
          {documentosDeclaracoes.length > 0 && (
            <div className={styles.secaoDocumentos}>
              <h3 className={styles.tituloSecao}>
                📝 Declarações e Formulários Assinados ({documentosDeclaracoes.length})
              </h3>
              <div className={styles.gridDocumentos}>
                {documentosDeclaracoes.map(doc => (
                  <div key={doc.id} className={styles.cardDocumento}>
                    <div className={styles.cardDocumentoHeader}>
                      <span className={styles.iconeArquivo}>{getFileIcon(doc.nomeArquivo)}</span>
                      <div className={styles.infoDocumento}>
                        <h4 className={styles.tipoDocumento}>{getTipoLabel(doc.tipo)}</h4>
                        <p className={styles.nomeArquivo}>{doc.nomeArquivo}</p>
                        <p className={styles.dataUpload}>
                          Enviado em {formatarData(doc.dataUpload)}
                        </p>
                      </div>
                    </div>
                    <div className={styles.cardDocumentoAcoes}>
                      <button
                        onClick={() => setDocumentoSelecionado(doc)}
                        className={styles.btnVisualizarDoc}
                        title="Visualizar documento"
                      >
                        👁️ Visualizar
                      </button>
                      <button
                        onClick={() => handleDownloadDocumento(doc)}
                        className={styles.btnBaixarDoc}
                        title="Baixar documento"
                      >
                        💾 Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Documentos Pessoais */}
          {Object.keys(documentosAgrupados).length > 0 && (
            <div className={styles.secaoDocumentos}>
              <h3 className={styles.tituloSecao}>
                🆔 Documentos Pessoais ({Object.values(documentosAgrupados).flat().length})
              </h3>
              <div className={styles.gridDocumentos}>
                {Object.entries(documentosAgrupados).map(([tipo, docs]) => 
                  docs.map(doc => (
                    <div key={doc.id} className={styles.cardDocumento}>
                      <div className={styles.cardDocumentoHeader}>
                        <span className={styles.iconeArquivo}>{getFileIcon(doc.nomeArquivo)}</span>
                        <div className={styles.infoDocumento}>
                          <h4 className={styles.tipoDocumento}>{getTipoLabel(doc.tipo)}</h4>
                          <p className={styles.nomeArquivo}>{doc.nomeArquivo}</p>
                          <p className={styles.dataUpload}>
                            Enviado em {formatarData(doc.dataUpload)}
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardDocumentoAcoes}>
                        <button
                          onClick={() => setDocumentoSelecionado(doc)}
                          className={styles.btnVisualizarDoc}
                          title="Visualizar documento"
                        >
                          👁️ Visualizar
                        </button>
                        <button
                          onClick={() => handleDownloadDocumento(doc)}
                          className={styles.btnBaixarDoc}
                          title="Baixar documento"
                        >
                          💾 Baixar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Resumo */}
          <div className={styles.resumoDocumentos}>
            <div className={styles.estatisticaDoc}>
              <span className={styles.numeroStat}>{matricula.documentos.length}</span>
              <span className={styles.labelStat}>Total de documentos</span>
            </div>
            <div className={styles.estatisticaDoc}>
              <span className={styles.numeroStat}>{documentosDeclaracoes.length}</span>
              <span className={styles.labelStat}>Declarações assinadas</span>
            </div>
            <div className={styles.estatisticaDoc}>
              <span className={styles.numeroStat}>
                {Object.values(documentosAgrupados).flat().length}
              </span>
              <span className={styles.labelStat}>Documentos pessoais</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização */}
      {documentoSelecionado && (
        <VisualizadorDocumento
          documento={documentoSelecionado}
          onFechar={() => setDocumentoSelecionado(null)}
        />
      )}
    </div>
  );
}
