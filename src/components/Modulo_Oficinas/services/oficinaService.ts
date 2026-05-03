import { Oficina, Responsavel, AgentesCidadania, Horario, AlunoOficina, DistribuicaoAluno, ResumoOficina } from '@/components/Modulo_Oficinas/types';

// Configuração da API - ajuste conforme seu ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/oficinas`;

// Função auxiliar para tratar erros
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// ============= OFICINAS =============

export const oficinaService = {
  // Listar todas as oficinas com filtros opcionais
  async listar(filtros?: {
    categoria?: string;
    status?: string;
    responsavel?: string;
    diaSemana?: string;
    dataInicio?: string;
    dataFim?: string;
    pesquisa?: string;
  }): Promise<Oficina[]> {
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
      
      console.log('[oficinaService.listar] Chamando API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      console.log('[oficinaService.listar] Oficinas recebidas:', data?.length);
      if (data && data.length > 0) {
        console.log('[oficinaService.listar] Primeira oficina:', data[0]);
        console.log('[oficinaService.listar] Horários da primeira oficina:', data[0]?.horarios);
      }
      
      return data;
    } catch (error) {
      console.error('[oficinaService.listar] Erro ao listar oficinas:', error);
      // Fallback para localStorage
      const oficinasSalvas = localStorage.getItem('oficinas');
      if (oficinasSalvas) {
        return JSON.parse(oficinasSalvas);
      }
      return [];
    }
  },

  // Buscar uma oficina por ID
  async buscarPorId(id: string): Promise<Oficina> {
    try {
      console.log('[oficinaService.buscarPorId] Buscando oficina:', id);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      console.log('[oficinaService.buscarPorId] Oficina encontrada:', data?.nome);
      console.log('[oficinaService.buscarPorId] Horários:', data?.horarios);
      
      return data;
    } catch (error) {
      console.error('[oficinaService.buscarPorId] Erro ao buscar oficina:', error);
      throw error;
    }
  },

  // Criar nova oficina
  async criar(oficina: Omit<Oficina, 'id' | 'dataCriacao'>): Promise<Oficina> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oficina),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar oficina:', error);
      throw error;
    }
  },

  // Atualizar oficina
  async atualizar(id: string, oficina: Partial<Oficina>): Promise<Oficina> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(oficina),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar oficina:', error);
      throw error;
    }
  },

  // Excluir oficina
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
      console.error('Erro ao excluir oficina:', error);
      throw error;
    }
  },

  // Obter resumo estatístico
  async obterResumo(): Promise<ResumoOficina> {
    try {
      const response = await fetch(`${API_URL}/resumo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao obter resumo:', error);
      // Fallback: calcular resumo localmente
      const oficinas = await this.listar();
      const responsaveis = await responsavelService.listar();
      const agentes = await agentesCidadaniaService.listar();

      const totalVagas = oficinas.reduce((total, o) => total + o.vagasTotais, 0);
      const vagasOcupadas = oficinas.reduce(
        (total, o) => total + (o.vagasTotais - o.vagasDisponiveis),
        0
      );
      const alunosInscritos = oficinas.reduce(
        (total, o) =>
          total + o.horarios.reduce((sum, h) => sum + h.alunosMatriculados.length, 0),
        0
      );

      return {
        totalOficinas: oficinas.length,
        oficinasAtivas: oficinas.filter((o) => o.status === 'ativa').length,
        totalVagas,
        vagasOcupadas,
        alunosInscritos,
        responsaveisAtivos: responsaveis.length,
        agentesCidadaniaAtivos: agentes.filter((a) => a.status === 'ativo').length,
      };
    }
  },
};

// ============= RESPONSÁVEIS =============

export const responsavelService = {
  // Listar todos os responsáveis
  async listar(): Promise<Responsavel[]> {
    try {
      const response = await fetch(`${API_URL}/responsaveis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar responsáveis:', error);
      const responsaveisSalvos = localStorage.getItem('responsaveis');
      if (responsaveisSalvos) {
        return JSON.parse(responsaveisSalvos);
      }
      return [];
    }
  },

  // Buscar responsável por ID
  async buscarPorId(id: string): Promise<Responsavel> {
    try {
      const response = await fetch(`${API_URL}/responsaveis/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar responsável:', error);
      throw error;
    }
  },

  // Criar novo responsável
  async criar(responsavel: Omit<Responsavel, 'id'>): Promise<Responsavel> {
    try {
      const response = await fetch(`${API_URL}/responsaveis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsavel),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      throw error;
    }
  },

  // Atualizar responsável
  async atualizar(id: string, responsavel: Partial<Responsavel>): Promise<Responsavel> {
    try {
      const response = await fetch(`${API_URL}/responsaveis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsavel),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      throw error;
    }
  },

  // Excluir responsável
  async excluir(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/responsaveis/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      console.error('Erro ao excluir responsável:', error);
      
      // Tratamento específico para erro de chave estrangeira
      if (error.message && error.message.includes('viola restrição de chave estrangeira')) {
        throw new Error('Não é possível excluir este responsável porque ele está vinculado a uma ou mais oficinas. Remova ou altere o responsável das oficinas antes de excluí-lo.');
      }
      
      throw error;
    }
  },
};

// ============= AGENTES CIDADANIA =============
// Agentes de Cidadania são alunos matriculados com flag especial

import { matriculaService } from '@/services/matriculaService';

export const agentesCidadaniaService = {
  // Listar todos os agentes cidadania
  async listar(): Promise<AgentesCidadania[]> {
    try {
      console.log('[agentesCidadaniaService.listar] Chamando API:', `${API_URL}/agentes-cidadania`);
      
      const response = await fetch(`${API_URL}/agentes-cidadania`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const agentes = await handleResponse(response);
      console.log('[agentesCidadaniaService.listar] Total de agentes encontrados:', agentes?.length);
      
      // Converter do formato do backend (snake_case) para o formato do frontend (camelCase)
      return agentes.map((agente: any) => ({
        id: agente.id,
        matriculaId: agente.id, // Usamos o ID do agente como matriculaId por enquanto
        nome: agente.nome,
        dataNascimento: agente.data_nascimento || agente.dataNascimento,
        cpf: agente.cpf,
        telefone: agente.telefone,
        endereco: agente.endereco,
        dataInicio: agente.data_inicio || agente.dataInicio,
        status: agente.status?.toLowerCase() || 'ativo',
        email: agente.email,
        oficinaId: agente.oficina_id || agente.oficinaId, // Converter oficina_id para oficinaId
        oficinasIds: agente.oficinas_ids || agente.oficinasIds || [], // Array de oficinas vinculadas
      }));
    } catch (error) {
      console.error('[agentesCidadaniaService.listar] Erro ao listar agentes cidadania:', error);
      const agentesSalvos = localStorage.getItem('agentesCidadania');
      if (agentesSalvos) {
        return JSON.parse(agentesSalvos);
      }
      return [];
    }
  },

  // Definir aluno como agente cidadania
  async definirAgente(
    matriculaId: string, 
    dataInicio: string, 
    oficinasIds?: string[]
  ): Promise<void> {
    try {
      console.log('[agentesCidadaniaService.definirAgente] Buscando matrícula:', matriculaId);
      // Buscar a matrícula completa primeiro
      const matricula = await matriculaService.buscarPorId(matriculaId);
      
      console.log('[agentesCidadaniaService.definirAgente] Matrícula encontrada:', matricula.nomeCompleto);
      
      // Criar agente cidadania usando o endpoint específico
      const agenteData = {
        nome: matricula.nomeCompleto,
        email: '', // A matrícula não tem email do aluno
        dataInicio: dataInicio,
        status: 'ativo',
        oficinasIds: oficinasIds || [], // Array de IDs das oficinas
      };
      
      console.log('[agentesCidadaniaService.definirAgente] Dados do agente:', agenteData);
      
      const response = await fetch(`${API_URL}/agentes-cidadania`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agenteData),
      });
      
      await handleResponse(response);
      
      console.log('[agentesCidadaniaService.definirAgente] Agente definido com sucesso');
      
      // Atualizar a matrícula também para marcar como agente
      await matriculaService.atualizar(matriculaId, {
        ...matricula,
        agentesCidadania: true,
        dataInicioAgente: dataInicio,
      });
      
    } catch (error) {
      console.error('[agentesCidadaniaService.definirAgente] Erro ao definir agente cidadania:', error);
      throw error;
    }
  },

  // Remover status de agente cidadania
  async removerAgente(agenteId: string): Promise<void> {
    try {
      console.log('[agentesCidadaniaService.removerAgente] Removendo agente:', agenteId);
      
      // Remover do backend usando o endpoint específico
      const response = await fetch(`${API_URL}/agentes-cidadania/${agenteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await handleResponse(response);
      
      console.log('[agentesCidadaniaService.removerAgente] Agente removido com sucesso');
    } catch (error) {
      console.error('[agentesCidadaniaService.removerAgente] Erro ao remover agente cidadania:', error);
      throw error;
    }
  },

  // Adicionar oficina a um agente cidadania
  async adicionarOficina(agenteId: string, oficinaId: string): Promise<void> {
    try {
      console.log('[agentesCidadaniaService.adicionarOficina] Adicionando oficina:', oficinaId, 'ao agente:', agenteId);
      
      const response = await fetch(`${API_URL}/agentes-cidadania/${agenteId}/oficinas/${oficinaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await handleResponse(response);
      
      console.log('[agentesCidadaniaService.adicionarOficina] Oficina adicionada com sucesso');
    } catch (error) {
      console.error('[agentesCidadaniaService.adicionarOficina] Erro ao adicionar oficina ao agente:', error);
      throw error;
    }
  },

  // Buscar por ID (retorna a matrícula como agente)
  async buscarPorId(id: string): Promise<AgentesCidadania | null> {
    try {
      const agentes = await this.listar();
      return agentes.find(a => a.id === id || a.matriculaId === id) || null;
    } catch (error) {
      console.error('Erro ao buscar agente cidadania:', error);
      return null;
    }
  },

  // Métodos legados mantidos para compatibilidade (delegam para as novas funções)
  async criar(agente: Omit<AgentesCidadania, 'id'>): Promise<AgentesCidadania> {
    throw new Error('Use definirAgente() com um ID de matrícula existente. Agentes cidadania devem ser alunos já matriculados.');
  },

  async atualizar(id: string, agente: Partial<AgentesCidadania>): Promise<AgentesCidadania> {
    try {
      // Converter camelCase para snake_case para o backend
      const payload: any = {};
      
      if (agente.nome !== undefined) payload.nome = agente.nome;
      if (agente.dataNascimento !== undefined) payload.data_nascimento = agente.dataNascimento;
      if (agente.cpf !== undefined) payload.cpf = agente.cpf;
      if (agente.telefone !== undefined) payload.telefone = agente.telefone;
      if (agente.endereco !== undefined) payload.endereco = agente.endereco;
      if (agente.dataInicio !== undefined) payload.data_inicio = agente.dataInicio;
      if (agente.status !== undefined) payload.status = agente.status?.toUpperCase();
      
      // IMPORTANTE: Converter oficinaId para oficina_id
      if (agente.oficinaId !== undefined) {
        payload.oficina_id = agente.oficinaId;
      }
      
      console.log('[agentesCidadaniaService.atualizar] Payload enviado:', payload);
      
      // Atualizar o agente no backend
      const response = await fetch(`${API_URL}/agentes-cidadania/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('[agentesCidadaniaService.atualizar] Erro ao atualizar agente:', error);
      
      // Se falhar, verificar se é mudança de status
      if (agente.status === 'inativo') {
        const agenteAtual = await this.buscarPorId(id);
        if (agenteAtual) {
          await this.removerAgente(agenteAtual.matriculaId);
        }
      }
      
      const agenteAtualizado = await this.buscarPorId(id);
      if (!agenteAtualizado) {
        throw new Error('Agente cidadania não encontrado');
      }
      return agenteAtualizado;
    }
  },

  async excluir(id: string): Promise<void> {
    const agente = await this.buscarPorId(id);
    if (agente) {
      await this.removerAgente(agente.matriculaId);
    }
  },
};

// ============= DISTRIBUIÇÃO DE ALUNOS =============

export const distribuicaoService = {
  // Inscrever aluno em uma oficina/horário
  async adicionarAluno(distribuicao: Omit<DistribuicaoAluno, 'dataInscricao'>): Promise<DistribuicaoAluno> {
    try {
      const payload = {
        ...distribuicao,
        dataInscricao: new Date().toISOString(),
      };
      
      console.log('[distribuicaoService.adicionarAluno] Enviando para API:', payload);
      console.log('[distribuicaoService.adicionarAluno] URL:', `${API_URL}/alunos`);
      
      const response = await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('[distribuicaoService.adicionarAluno] Status da resposta:', response.status);
      const result = await handleResponse(response);
      console.log('[distribuicaoService.adicionarAluno] Resultado:', result);
      return result;
    } catch (error) {
      console.error('[distribuicaoService.adicionarAluno] Erro ao adicionar aluno à oficina:', error);
      throw error;
    }
  },

  // Listar todas as distribuições
  async listar(): Promise<DistribuicaoAluno[]> {
    try {
      const response = await fetch(`${API_URL}/alunos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar distribuições:', error);
      return [];
    }
  },

  // Listar oficinas de um aluno
  async listarPorAluno(alunoId: string): Promise<DistribuicaoAluno[]> {
    try {
      const response = await fetch(`${API_URL}/alunos/matricula/${alunoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar oficinas do aluno:', error);
      return [];
    }
  },

  // Listar alunos de uma oficina
  async listarAlunosOficina(oficinaId: string): Promise<DistribuicaoAluno[]> {
    try {
      const response = await fetch(`${API_URL}/alunos/oficina/${oficinaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar alunos da oficina:', error);
      return [];
    }
  },

  // Atualizar distribuição
  async atualizar(id: string, distribuicao: Partial<DistribuicaoAluno>): Promise<DistribuicaoAluno> {
    try {
      const response = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(distribuicao),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar distribuição:', error);
      throw error;
    }
  },

  // Cancelar inscrição (remover aluno)
  async removerAluno(distribuicaoId: string): Promise<void> {
    try {
      console.log('[distribuicaoService.removerAluno] Removendo distribuição ID:', distribuicaoId);
      
      const response = await fetch(`${API_URL}/alunos/${distribuicaoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[distribuicaoService.removerAluno] Response status:', response.status);
      
      await handleResponse(response);
      
      console.log('[distribuicaoService.removerAluno] Distribuição removida com sucesso');
    } catch (error) {
      console.error('[distribuicaoService.removerAluno] Erro ao remover aluno da oficina:', error);
      throw error;
    }
  },

  // Método legado mantido para compatibilidade
  async removerAlunoLegacy(alunoId: string, oficinaId: string, horarioId: string): Promise<void> {
    try {
      console.log('[removerAlunoLegacy] Buscando distribuição:', { alunoId, oficinaId, horarioId });
      
      // Buscar a distribuição correspondente
      const distribuicoes = await this.listarAlunosOficina(oficinaId);
      console.log('[removerAlunoLegacy] Total de distribuições encontradas:', distribuicoes.length);
      console.log('[removerAlunoLegacy] Distribuições completas:', JSON.stringify(distribuicoes, null, 2));
      
      // Procurar por alunoId ou matriculaId
      const distribuicao = distribuicoes.find(
        (d) => {
          const matchAlunoId = d.alunoId === alunoId;
          const matchMatriculaId = d.matriculaId === alunoId;
          const matchHorarioId = d.horarioId === horarioId;
          
          console.log(`[removerAlunoLegacy] Verificando distribuição:`, {
            id: d.id,
            alunoId: d.alunoId,
            matriculaId: d.matriculaId,
            horarioId: d.horarioId,
            matchAlunoId,
            matchMatriculaId,
            matchHorarioId,
            match: (matchAlunoId || matchMatriculaId) && matchHorarioId
          });
          
          return (matchAlunoId || matchMatriculaId) && matchHorarioId;
        }
      );
      
      console.log('[removerAlunoLegacy] Distribuição selecionada:', distribuicao);
      
      if (distribuicao?.id) {
        console.log('[removerAlunoLegacy] Removendo distribuição ID:', distribuicao.id);
        await this.removerAluno(distribuicao.id);
        console.log('[removerAlunoLegacy] Remoção concluída com sucesso');
      } else {
        console.error('[removerAlunoLegacy] Distribuição não encontrada. Dados:', {
          alunoId,
          horarioId,
          distribuicoesDisponiveis: distribuicoes.map(d => ({
            id: d.id,
            alunoId: d.alunoId,
            matriculaId: d.matriculaId,
            horarioId: d.horarioId
          }))
        });
        throw new Error('Distribuição não encontrada');
      }
    } catch (error) {
      console.error('[removerAlunoLegacy] Erro ao remover aluno:', error);
      throw error;
    }
  },
};
