import React, { useRef, useState } from 'react';
import { Matricula, DocumentoAnexo } from '../../types';
import { uploadDocumento } from '../../utils/uploadService';
import styles from '../../styles/Matricula.module.css';

interface AnexarRenovacaoProps {
  matricula: Matricula;
  onSalvar: (matricula: Matricula) => void;
  onCancelar: () => void;
}

export default function AnexarRenovacao({ matricula, onSalvar, onCancelar }: AnexarRenovacaoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const renovacaoExistente = matricula.documentos.find(
    doc => doc.tipo === 'renovacao_assinada'
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoSelecionado(file);
      
      // Criar URL do arquivo para preview e download
      const fileURL = URL.createObjectURL(file);
      
      // Criar preview se for imagem
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Para PDFs e outros, usar a URL do objeto
        setPreview(fileURL);
      }
    }
  };

  const handleAnexar = async () => {
    if (!arquivoSelecionado) {
      alert('Por favor, selecione um arquivo primeiro.');
      return;
    }

    try {
      setCarregando(true);
      
      // Upload do arquivo para o servidor
      const resultado = await uploadDocumento(arquivoSelecionado, 'renovacao_assinada');
      
      if (!resultado.success) {
        alert(`Erro ao fazer upload: ${resultado.error}`);
        return;
      }

      const novoDocumento: DocumentoAnexo = {
        id: `DOC${Date.now()}`,
        tipo: 'renovacao_assinada',
        nomeArquivo: resultado.fileName || arquivoSelecionado.name,
        arquivo: arquivoSelecionado,
        url: resultado.filePath,
        dataUpload: new Date(),
      };

      // Remover renovação anterior se existir
      const documentosAtualizados = matricula.documentos.filter(
        doc => doc.tipo !== 'renovacao_assinada'
      );

      const matriculaAtualizada = {
        ...matricula,
        documentos: [...documentosAtualizados, novoDocumento],
        dataAtualizacao: new Date(),
      };

      onSalvar(matriculaAtualizada);
      alert('Renovação de matrícula assinada anexada com sucesso!');
    } catch (error) {
      console.error('Erro ao anexar renovação:', error);
      alert('Erro ao anexar renovação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRemover = () => {
    if (!confirm('Deseja realmente remover a renovação assinada?')) {
      return;
    }

    const documentosAtualizados = matricula.documentos.filter(
      doc => doc.tipo !== 'renovacao_assinada'
    );

    const matriculaAtualizada = {
      ...matricula,
      documentos: documentosAtualizados,
      dataAtualizacao: new Date(),
    };

    onSalvar(matriculaAtualizada);
    alert('Renovação assinada removida com sucesso!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Anexar Renovação de Matrícula Assinada</h1>
        <p>Faça upload do formulário de renovação de matrícula assinado pelo responsável</p>
      </div>

      <div className={styles.form}>
        {/* Informações da Matrícula */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações da Matrícula</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Matrícula Nº</label>
              <input type="text" value={matricula.id || ''} className={styles.input} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Aluno</label>
              <input type="text" value={matricula.nomeCompleto} className={styles.input} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Responsável</label>
              <input type="text" value={matricula.nomeResponsavel} className={styles.input} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <input 
                type="text" 
                value={renovacaoExistente ? '✅ Renovação Anexada' : '⏳ Aguardando Renovação'} 
                className={styles.input} 
                readOnly 
                style={{ 
                  background: renovacaoExistente ? '#dbeafe' : '#fef3c7',
                  color: renovacaoExistente ? '#1e40af' : '#92400e',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>
        </div>

        {/* Renovação Existente */}
        {renovacaoExistente && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Renovação Atual</h2>
            <div style={{ 
              padding: '20px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                <strong>Arquivo:</strong> {renovacaoExistente.nomeArquivo}
              </p>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
                <strong>Data do upload:</strong>{' '}
                {new Date(renovacaoExistente.dataUpload).toLocaleString('pt-BR')}
              </p>
              
              {renovacaoExistente.url && (
                <div style={{ marginBottom: '15px' }}>
                  <img 
                    src={renovacaoExistente.url} 
                    alt="Renovação assinada" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              )}

              <button 
                onClick={handleRemover}
                className={`${styles.button} ${styles.buttonDanger}`}
                style={{ marginTop: '10px' }}
              >
                🗑️ Remover Renovação
              </button>
            </div>
          </div>
        )}

        {/* Upload Nova Renovação */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {renovacaoExistente ? 'Substituir Renovação' : 'Anexar Renovação'}
          </h2>
          
          <div style={{ 
            padding: '30px',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            background: '#f8fafc'
          }}>
            
            <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
              Selecione o formulário de renovação assinado
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#4a5568', fontSize: '14px' }}>
              Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              📁 Escolher Arquivo
            </button>

            {arquivoSelecionado && (
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#1a1a1a' }}>
                  Arquivo selecionado:
                </p>
                <p style={{ margin: '0', color: '#4a5568', fontSize: '14px' }}>
                  {arquivoSelecionado.name} ({(arquivoSelecionado.size / 1024).toFixed(1)} KB)
                </p>

                {preview && (
                  <div style={{ marginTop: '15px' }}>
                    <img 
                      src={preview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Instruções</h2>
          <ol style={{ 
            lineHeight: '2',
            color: '#4a5568',
            paddingLeft: '25px',
            margin: 0
          }}>
            <li>Imprima o formulário de renovação de matrícula em branco</li>
            <li>Preencha manualmente a seção "Necessidade de atualizar documentação"</li>
            <li>Solicite a assinatura do responsável e do profissional de referência</li>
            <li>Escaneie ou fotografe o formulário preenchido e assinado</li>
            <li>Faça upload do arquivo usando o botão acima</li>
            <li>Clique em "Salvar" para anexar à matrícula</li>
          </ol>
        </div>

        {/* Ações */}
        <div className={styles.actions}>
          <button 
            onClick={onCancelar} 
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Cancelar
          </button>
          <button 
            onClick={handleAnexar}
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={!arquivoSelecionado}
          >
            💾 Salvar Renovação
          </button>
        </div>
      </div>
    </div>
  );
}
