/**
 * Utilitário para upload de documentos
 * Envia arquivos para o servidor e os organiza em pastas específicas
 */

export interface UploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

/**
 * Faz upload de um arquivo para o servidor
 * 
 * @param file - Arquivo a ser enviado
 * @param tipoDocumento - Tipo do documento (determina a pasta de destino)
 * @returns Resultado do upload com caminho do arquivo salvo
 */
export async function uploadDocumento(
  file: File,
  tipoDocumento: string
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipoDocumento);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erro ao fazer upload do arquivo',
      };
    }

    return result;
  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      error: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Faz upload de múltiplos arquivos
 * 
 * @param files - Lista de arquivos e seus tipos
 * @returns Array com resultados dos uploads
 */
export async function uploadMultiplosDocumentos(
  files: Array<{ file: File; tipo: string }>
): Promise<UploadResult[]> {
  const uploads = files.map(({ file, tipo }) => uploadDocumento(file, tipo));
  return Promise.all(uploads);
}

/**
 * Remove um arquivo do servidor
 * 
 * @param filePath - Caminho do arquivo a ser removido
 * @returns Resultado da operação
 */
export async function removerDocumento(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    return {
      success: false,
      error: 'Erro ao conectar com o servidor',
    };
  }
}
