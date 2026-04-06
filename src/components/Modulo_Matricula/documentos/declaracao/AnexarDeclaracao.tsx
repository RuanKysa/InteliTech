import React, { useRef, useState } from 'react';
import { Matricula, DocumentoAnexo } from '../../types';
import { uploadDocumento } from '../../utils/uploadService';
import styles from '../../styles/Matricula.module.css';

interface AnexarDeclaracaoProps {
  matricula: Matricula;
  onSalvar: (matricula: Matricula) => void;
  onCancelar: () => void;
}

export default function AnexarDeclaracao({ matricula, onSalvar, onCancelar }: AnexarDeclaracaoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const declaracaoExistente = matricula.documentos.find(
    doc => doc.tipo === 'declaracao_assinada'
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
      const resultado = await uploadDocumento(arquivoSelecionado, 'declaracao_assinada');
      
      if (!resultado.success) {
        alert(`Erro ao fazer upload: ${resultado.error}`);
        return;
      }

      const novoDocumento: DocumentoAnexo = {
        id: `DOC${Date.now()}`,
        tipo: 'declaracao_assinada',
        nomeArquivo: resultado.fileName || arquivoSelecionado.name,
        arquivo: arquivoSelecionado,
        url: resultado.filePath,
        dataUpload: new Date(),
      };

      // Remover declaração anterior se existir
      const documentosAtualizados = matricula.documentos.filter(
        doc => doc.tipo !== 'declaracao_assinada'
      );

      const matriculaAtualizada = {
        ...matricula,
        documentos: [...documentosAtualizados, novoDocumento],
        matriculaAssinada: true,
        dataAtualizacao: new Date(),
      };

      onSalvar(matriculaAtualizada);
      alert('Declaração assinada anexada com sucesso!');
    } catch (error) {
      console.error('Erro ao anexar declaração:', error);
      alert('Erro ao anexar declaração. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRemover = () => {
    if (!confirm('Deseja realmente remover a declaração assinada?')) {
      return;
    }

    const documentosAtualizados = matricula.documentos.filter(
      doc => doc.tipo !== 'declaracao_assinada'
    );

    const matriculaAtualizada = {
      ...matricula,
      documentos: documentosAtualizados,
      matriculaAssinada: false,
      dataAtualizacao: new Date(),
    };

    onSalvar(matriculaAtualizada);
    alert('Declaração assinada removida com sucesso!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Anexar Declaração Assinada</h1>
          <p>Faça upload da declaração de matrícula assinada pelo responsável</p>
        </div>
      </div>

      <div className={styles.anexarLayout}>
        {/* Sidebar com Informações e Instruções */}
        <aside className={styles.anexarSidebar}>
          {/* Informações da Matrícula */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Informações da Matrícula</h3>
            <div className={styles.infoCardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nº Matrícula:</span>
                <span className={styles.infoValue}>{matricula.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Aluno:</span>
                <span className={styles.infoValue}>{matricula.nomeCompleto}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Responsável:</span>
                <span className={styles.infoValue}>{matricula.nomeResponsavel}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={declaracaoExistente ? styles.statusAnexado : styles.statusPendente}>
                  {declaracaoExistente ? 'Anexada' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>Como Anexar</h3>
            <ol className={styles.instructionsList}>
              <li>Imprima a declaração em branco</li>
              <li>Obtenha a assinatura do responsável</li>
              <li>Escaneie ou fotografe o documento</li>
              <li>Selecione o arquivo (PDF, JPG ou PNG)</li>
              <li>Clique em Salvar para anexar</li>
            </ol>
          </div>
        </aside>

        {/* Área Principal de Upload */}
        <main className={styles.anexarMain}>
          {/* Declaração Existente */}
          {declaracaoExistente && (
            <div className={styles.documentoExistente}>
              <div className={styles.documentoExistenteHeader}>
                <h3>Declaração Atual</h3>
              </div>
              <div className={styles.documentoExistenteBody}>
                <div className={styles.documentoInfo}>
                  <p><strong>Arquivo:</strong> {declaracaoExistente.nomeArquivo}</p>
                  <p><strong>Upload em:</strong> {new Date(declaracaoExistente.dataUpload).toLocaleString('pt-BR')}</p>
                </div>
                
                {declaracaoExistente.url && (
                  <div className={styles.previewContainer}>
                    <img 
                      src={declaracaoExistente.url} 
                      alt="Declaração assinada" 
                      className={styles.previewImage}
                    />
                  </div>
                )}

                <button 
                  onClick={handleRemover}
                  className={styles.buttonRemover}
                >
                  Remover Declaração
                </button>
              </div>
            </div>
          )}

          {/* Área de Upload */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadCardTitle}>
              {declaracaoExistente ? 'Substituir Declaração' : 'Anexar Declaração'}
            </h3>
            
            <div 
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <h4 className={styles.uploadTitle}>Selecione a declaração assinada</h4>
              <p className={styles.uploadSubtitle}>
                Arraste e solte o arquivo aqui ou clique para selecionar
              </p>
              <p className={styles.uploadFormats}>
                Formatos: PDF, JPG, PNG • Tamanho máximo: 10MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {arquivoSelecionado && (
              <div className={styles.arquivoSelecionado}>
                <div className={styles.arquivoInfo}>
                  <div className={styles.arquivoDetalhes}>
                    <p className={styles.arquivoNome}>{arquivoSelecionado.name}</p>
                    <p className={styles.arquivoTamanho}>
                      {(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {preview && arquivoSelecionado.type.startsWith('image/') && (
                  <div className={styles.previewContainer}>
                    <p className={styles.previewLabel}>Pré-visualização:</p>
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className={styles.previewImage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className={styles.anexarActions}>
            <button 
              onClick={onCancelar} 
              className={styles.buttonCancel}
            >
              ← Voltar
            </button>
            <button 
              onClick={handleAnexar}
              className={styles.buttonSave}
              disabled={!arquivoSelecionado}
            >
              Salvar Declaração
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
