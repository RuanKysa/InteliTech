import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';

// Desabilitar o bodyParser do Next.js para usar formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Mapeamento de tipos de documentos para pastas
const PASTA_POR_TIPO: Record<string, string> = {
  'declaracao_assinada': 'declaracoes',
  'renovacao_assinada': 'renovacoes',
  'ficha_natacao_assinada': 'fichas_natacao',
  'desistencia_assinada': 'desistencias',
  'rg': 'documentos_pessoais',
  'cpf': 'documentos_pessoais',
  'comprovante_residencia': 'comprovantes',
  'foto': 'fotos',
  'certidao_nascimento': 'documentos_pessoais',
  'outro': 'outros',
};

interface UploadResponse {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { fields, files } = await parseForm(req);
    
    const tipoDocumento = Array.isArray(fields.tipo) ? fields.tipo[0] : fields.tipo;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !tipoDocumento) {
      return res.status(400).json({ 
        success: false, 
        error: 'Arquivo e tipo de documento são obrigatórios' 
      });
    }

    // Determinar a pasta baseado no tipo de documento
    const pasta = PASTA_POR_TIPO[tipoDocumento] || 'outros';
    
    // Criar o caminho da pasta no servidor
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', pasta);
    
    // Criar a pasta se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'arquivo';
    const fileExtension = path.extname(originalName);
    const baseFileName = path.basename(originalName, fileExtension);
    const newFileName = `${baseFileName}_${timestamp}${fileExtension}`;
    const newFilePath = path.join(uploadDir, newFileName);

    // Mover o arquivo temporário para a pasta de uploads
    fs.renameSync(file.filepath, newFilePath);

    // Retornar o caminho relativo do arquivo (acessível via /uploads/...)
    const relativePath = `/uploads/${pasta}/${newFileName}`;

    return res.status(200).json({
      success: true,
      filePath: relativePath,
      fileName: newFileName,
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar upload do arquivo' 
    });
  }
}

// Função auxiliar para processar o formulário multipart
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}
