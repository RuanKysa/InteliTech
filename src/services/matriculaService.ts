import { Matricula } from '@/components/Modulo_Matricula/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/matriculas`;

console.log('[matriculaService] API_URL configurada:', API_URL);

// Função auxiliar para tratar erros
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }
  
  // Se for DELETE e não há conteúdo, retornar null
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Converter dados do frontend para formato do backend
const formatMatriculaParaBackend = (matricula: Matricula) => {
  return {
    nomeCompleto: matricula.nomeCompleto,
    dataNascimento: matricula.dataNascimento,
    idade: matricula.idade || 0,
    turnoSCFV: matricula.turnoSCFV,
    naturalidade: matricula.naturalidade,
    municipio: matricula.municipio,
    uf: matricula.uf,
    pais: matricula.pais,
    rg: matricula.rg,
    rgUF: matricula.rgUF,
    dataExpedicao: matricula.dataExpedicao,
    cpf: matricula.cpf,
    cadUnicoAluno: matricula.cadUnicoAluno,
    cadUnicoResponsavel: matricula.cadUnicoResponsavel,
    etnia: matricula.etnia,
    programaSocial: matricula.programaSocial,
    quantasPessoasResidencia: matricula.quantasPessoasResidencia,
    nomeMae: matricula.nomeMae,
    rgMae: matricula.rgMae,
    ufMae: matricula.ufMae,
    nomePai: matricula.nomePai,
    rgPai: matricula.rgPai,
    ufPai: matricula.ufPai,
    nomeResponsavel: matricula.nomeResponsavel,
    parentesco: matricula.parentesco,
    endereco: matricula.endereco,
    numeroEndereco: matricula.numeroEndereco,
    complemento: matricula.complemento,
    bairro: matricula.bairro,
    postoDeSaude: matricula.postoDeSaude,
    telefone: matricula.telefone,
    telefoneOutro: matricula.telefoneOutro,
    escola: matricula.escola,
    serie: matricula.serie,
    turno: matricula.turno,
    possuiDeficiencia: matricula.possuiDeficiencia,
    tipoDeficiencia: matricula.tipoDeficiencia,
    usaRemediosControlados: matricula.usaRemediosControlados || false,
    observacaoRemedios: matricula.observacaoRemedios || '',
    observacoes: matricula.observacoes,
    utilizaTransporte: matricula.utilizaTransporte,
    localEmbarque: matricula.localEmbarque,
    localDesembarque: matricula.localDesembarque,
    almoco: matricula.almoco,
    encaminhadoPor: matricula.encaminhadoPor,
    dataEncaminhamento: matricula.dataEncaminhamento,
    documentos: matricula.documentos.map(doc => ({
      id: doc.id,
      tipo: doc.tipo,
      nomeArquivo: doc.nomeArquivo,
      url: doc.url || '',
      dataUpload: doc.dataUpload instanceof Date ? doc.dataUpload.toISOString() : doc.dataUpload
    })),
    status: matricula.status,
    assinatura: matricula.assinatura || '',
    matriculaAssinada: matricula.matriculaAssinada,
    // Campos para Agentes Cidadania
    agentesCidadania: matricula.agentesCidadania || false,
    dataInicioAgente: matricula.dataInicioAgente
  };
};

export const matriculaService = {
  // Listar todas as matrículas
  async listar(): Promise<Matricula[]> {
    try {
      console.log('[matriculaService.listar] Chamando API:', API_URL);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[matriculaService.listar] Status da resposta:', response.status);
      const data = await handleResponse(response);
      console.log('[matriculaService.listar] Dados recebidos:', data?.length, 'matrículas');
      console.log('[matriculaService.listar] Primeiras 3 matrículas:', data?.slice(0, 3));
      return data;
    } catch (error) {
      console.error('[matriculaService.listar] Erro ao listar matrículas:', error);
      throw error;
    }
  },

  // Buscar uma matrícula por ID
  async buscarPorId(id: string): Promise<Matricula> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar matrícula:', error);
      throw error;
    }
  },

  // Criar nova matrícula
  async criar(matricula: Matricula): Promise<Matricula> {
    try {
      const dados = formatMatriculaParaBackend(matricula);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      throw error;
    }
  },

  // Atualizar matrícula existente
  async atualizar(id: string, matricula: Matricula): Promise<Matricula> {
    try {
      const dados = formatMatriculaParaBackend(matricula);
      
      console.log('[matriculaService.atualizar] Atualizando matrícula:', id);
      console.log('[matriculaService.atualizar] URL:', `${API_URL}/${id}`);
      console.log('[matriculaService.atualizar] Dados:', dados);
      console.log('[matriculaService.atualizar] agentesCidadania:', dados.agentesCidadania);
      console.log('[matriculaService.atualizar] dataInicioAgente:', dados.dataInicioAgente);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      
      console.log('[matriculaService.atualizar] Status da resposta:', response.status);
      const resultado = await handleResponse(response);
      console.log('[matriculaService.atualizar] Matrícula atualizada com sucesso');
      return resultado;
    } catch (error) {
      console.error('[matriculaService.atualizar] Erro ao atualizar matrícula:', error);
      throw error;
    }
  },

  // Excluir matrícula
  async excluir(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await handleResponse(response);
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      throw error;
    }
  },
};
