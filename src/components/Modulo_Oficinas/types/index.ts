// Tipos e interfaces para o módulo de oficinas

export interface Responsavel {
  id: string;
  nome: string;
  tipo: 'professor' | 'estagiario';
  email?: string;
  telefone?: string;
  especialidade?: string;
  dataAdmissao?: string;
}

export interface AgentesCidadania {
  id: string;
  matriculaId: string; // Referência à matrícula do aluno
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  dataInicio: string; // Data de início como agente cidadania
  status: 'ativo' | 'inativo';
  // Dados adicionais vindos da matrícula
  idade?: number;
  turnoSCFV?: string;
  // Oficinas vinculadas
  oficinaId?: string; // Oficina principal do agente
  oficinasIds?: string[]; // Lista de oficinas onde o agente atua (para suporte futuro)
}

export interface Horario {
  id?: string; // Opcional - será gerado pelo backend ao criar
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';
  horaInicio: string; // formato HH:MM
  horaFim: string; // formato HH:MM
  vagas: number;
  alunosMatriculados: AlunoOficina[];
}

export interface AlunoOficina {
  id: string;
  matriculaId: string; // Referência à matrícula do aluno
  nomeCompleto: string;
  idade: number;
  turno?: string;
  observacoes?: string;
  dataInscricao: Date;
}

export interface Oficina {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'esporte' | 'arte' | 'musica' | 'danca' | 'artesanato' | 'informatica' | 'idiomas' | 'outras';
  
  // Responsável
  responsavel?: Responsavel;
  responsavelId?: string;
  
  // Horários
  horarios: Horario[];
  
  // Configurações
  idadeMinima?: number;
  idadeMaxima?: number;
  vagasTotais: number;
  vagasDisponiveis: number;
  
  // Período
  dataInicio: string;
  dataFim: string;
  
  // Localização
  local?: string;
  sala?: string;
  
  // Materiais necessários
  materiais?: string[];
  
  // Status
  status: 'planejada' | 'ativa' | 'suspensa' | 'encerrada';
  
  // Controle
  dataCriacao: Date;
  dataAtualizacao?: Date;
  criadoPor?: string;
}

export interface FiltrosOficina {
  categoria?: string;
  status?: string;
  responsavel?: string;
  diaSemana?: string;
  dataInicio?: string;
  dataFim?: string;
  pesquisa?: string;
}

export interface DistribuicaoAluno {
  alunoId: string; // Mantém para compatibilidade
  matriculaId: string; // Campo obrigatório do backend
  nomeCompleto: string; // Campo obrigatório do backend
  oficinaId: string;
  horarioId: string;
  dataInscricao: Date;
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
}

export interface ResumoOficina {
  totalOficinas: number;
  oficinasAtivas: number;
  totalVagas: number;
  vagasOcupadas: number;
  alunosInscritos: number;
  responsaveisAtivos: number;
  agentesCidadaniaAtivos: number;
}
