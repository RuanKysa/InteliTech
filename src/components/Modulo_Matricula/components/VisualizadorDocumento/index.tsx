import React from 'react';
import { DocumentoAnexo } from '../../types';
import styles from './VisualizadorDocumento.module.css';

interface VisualizadorDocumentoProps {
  documento: DocumentoAnexo;
  onFechar: () => void;
}

export default function VisualizadorDocumento({ documento, onFechar }: VisualizadorDocumentoProps) {
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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = () => {
    const ext = getFileExtension(documento.nomeArquivo);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
  };

  const isPDF = () => {
    const ext = getFileExtension(documento.nomeArquivo);
    return ext === 'pdf';
  };

  const handleDownload = () => {
    if (documento.url) {
      const link = document.createElement('a');
      link.href = documento.url;
      link.download = documento.nomeArquivo;
      link.click();
    }
  };

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.titulo}>{getTipoLabel(documento.tipo)}</h2>
            <p className={styles.filename}>{documento.nomeArquivo}</p>
          </div>
          <div className={styles.acoes}>
            {documento.url && (
              <button onClick={handleDownload} className={styles.btnDownload}>
                💾 Baixar
              </button>
            )}
            <button onClick={onFechar} className={styles.btnFechar}>
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className={styles.conteudo}>
          {documento.url ? (
            <>
              {isImage() && (
                <img 
                  src={documento.url} 
                  alt={documento.nomeArquivo}
                  className={styles.imagem}
                />
              )}
              
              {isPDF() && (
                <iframe
                  src={documento.url}
                  className={styles.pdf}
                  title={documento.nomeArquivo}
                />
              )}

              {!isImage() && !isPDF() && (
                <div className={styles.semPreview}>
                  <p className={styles.mensagem}>
                    Preview não disponível para este tipo de arquivo
                  </p>
                  <p className={styles.submensagem}>
                    Clique em "Baixar" para visualizar o arquivo
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.semPreview}>
              <p className={styles.mensagem}>Arquivo não carregado</p>
              <p className={styles.submensagem}>
                O arquivo original não está disponível para visualização
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.info}>
            <strong>Data de upload:</strong>{' '}
            {new Date(documento.dataUpload).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
