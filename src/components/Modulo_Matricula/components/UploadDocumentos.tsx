import React, { useRef, useState } from 'react';
import { DocumentoAnexo } from '../types';
import { uploadDocumento } from '../utils/uploadService';
import VisualizadorDocumento from './VisualizadorDocumento';
import styles from '../styles/Matricula.module.css';

interface UploadDocumentosProps {
  documentos: DocumentoAnexo[];
  onDocumentosChange: (documentos: DocumentoAnexo[]) => void;
}

const tiposDocumento = [
  { value: 'rg', label: 'RG' },
  { value: 'cpf', label: 'CPF' },
  { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
  { value: 'foto', label: 'Foto 3x4' },
  { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
  { value: 'declaracao_assinada', label: 'Declaração Assinada' },
  { value: 'renovacao_assinada', label: 'Renovação Assinada' },
  { value: 'ficha_natacao_assinada', label: 'Ficha de Natação Assinada' },
  { value: 'desistencia_assinada', label: 'Solicitação de Desistência Assinada' },
  { value: 'outro', label: 'Outro' },
];

export default function UploadDocumentos({ documentos, onDocumentosChange }: UploadDocumentosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>('rg');
  const [documentoAberto, setDocumentoAberto] = useState<DocumentoAnexo | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setCarregando(true);
    const novosDocumentos: DocumentoAnexo[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload do arquivo para o servidor
        const resultado = await uploadDocumento(file, tipoSelecionado);
        
        if (resultado.success && resultado.filePath) {
          const novoDocumento: DocumentoAnexo = {
            id: `${Date.now()}-${i}`,
            tipo: tipoSelecionado as any,
            nomeArquivo: resultado.fileName || file.name,
            arquivo: file,
            url: resultado.filePath,
            dataUpload: new Date(),
          };
          novosDocumentos.push(novoDocumento);
        } else {
          alert(`Erro ao fazer upload de ${file.name}: ${resultado.error}`);
        }
      }

      if (novosDocumentos.length > 0) {
        onDocumentosChange([...documentos, ...novosDocumentos]);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload dos arquivos. Tente novamente.');
    } finally {
      setCarregando(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoverDocumento = (id: string) => {
    onDocumentosChange(documentos.filter(doc => doc.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getTipoLabel = (tipo: string) => {
    return tiposDocumento.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Tipo de Documento
        </label>
        <select
          className={styles.select}
          value={tipoSelecionado}
          onChange={(e) => setTipoSelecionado(e.target.value)}
        >
          {tiposDocumento.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div 
        className={styles.uploadArea}
        onClick={carregando ? undefined : handleUploadClick}
        style={{ opacity: carregando ? 0.6 : 1, cursor: carregando ? 'wait' : 'pointer' }}
      >
        <div className={styles.uploadText}>
          {carregando ? '⏳ Enviando arquivos...' : 'Clique aqui para selecionar arquivos ou arraste e solte'}
        </div>
        <div className={styles.uploadText} style={{ fontSize: '12px', marginTop: '5px' }}>
          Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {documentos.length > 0 && (
        <div className={styles.documentsList}>
          <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Documentos Anexados ({documentos.length})</h4>
          {documentos.map(doc => (
            <div key={doc.id} className={styles.documentItem}>
              <div className={styles.documentInfo}>
                <span>📎</span>
                <div>
                  <div className={styles.documentName}>{doc.nomeArquivo}</div>
                  <div className={styles.documentType}>{getTipoLabel(doc.tipo)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {doc.url && (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => setDocumentoAberto(doc)}
                    style={{ padding: '8px 16px' }}
                  >
                    👁️ Ver
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={() => handleRemoverDocumento(doc.id)}
                  style={{ padding: '8px 16px' }}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          ))}
        </div>
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
