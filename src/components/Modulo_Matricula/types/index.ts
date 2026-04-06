// Tipos e interfaces para o módulo de matrícula

export interface DocumentoAnexo {
  id: string;
  tipo: 'rg' | 'cpf' | 'comprovante_residencia' | 'foto' | 'certidao_nascimento' | 'declaracao_assinada' | 'renovacao_assinada' | 'ficha_natacao_assinada' | 'desistencia_assinada' | 'outro';
  nomeArquivo: string;
  arquivo: File | null;
  url?: string;
  dataUpload: Date;
}

export interface Matricula {
  id?: string;
  
  // DADOS PESSOAIS
  nomeCompleto: string;
  dataNascimento: string;
  idade?: number;
  turnoSCFV: 'manha' | 'tarde' | 'integral' | '';
  naturalidade: string;
  municipio: string;
  uf: string;
  pais: string;
  
  // DOCUMENTOS
  rg: string;
  rgUF: string;
  dataExpedicao: string;
  cpf: string;
  
  // CAD ÚNICO (NIS)
  cadUnicoAluno: string;
  cadUnicoResponsavel: string;
  
  // ETNIA/RAÇA
  etnia: 'branca' | 'negra' | 'parda' | 'amarela' | 'indigena' | 'nao_informar';
  
  // PROGRAMAS SOCIAIS
  programaSocial: 'nao_possui' | 'bolsa_familia' | 'bpc' | 'tarifa_social';
  quantasPessoasResidencia: number;
  
  // FILIAÇÃO
  nomeMae: string;
  rgMae: string;
  ufMae: string;
  nomePai: string;
  rgPai: string;
  ufPai: string;
  
  // RESPONSÁVEL
  nomeResponsavel: string;
  parentesco: string;
  
  // ENDEREÇO
  endereco: string;
  numeroEndereco: string;
  complemento: string;
  bairro: string;
  postoDeSaude: string;
  
  // CONTATO
  telefone: string;
  telefoneOutro: string;
  
  // ESCOLA
  escola: string;
  serie: string;
  turno: 'manha' | 'tarde' | 'noite' | '';
  
  // DEFICIÊNCIA
  possuiDeficiencia: boolean;
  tipoDeficiencia: 'fisica' | 'auditiva' | 'visual' | 'mental' | 'nao_possui';
  
  // REMÉDIOS CONTROLADOS
  usaRemediosControlados?: boolean;
  observacaoRemedios?: string;
  
  // OBSERVAÇÕES
  observacoes: string;
  
  // TRANSPORTE E ALIMENTAÇÃO
  utilizaTransporte: boolean;
  localEmbarque: string;
  localDesembarque: string;
  almoco: boolean;
  
  // ENCAMINHAMENTO
  encaminhadoPor: string;
  dataEncaminhamento: string;
  
  // Documentos Anexados
  documentos: DocumentoAnexo[];
  
  // Controle
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'aguardando_documentos';
  dataCadastro: Date;
  dataAtualizacao?: Date;
  assinatura?: string;
  matriculaAssinada: boolean;
  
  // Agente Cidadania
  agentesCidadania?: boolean; // Define se o aluno é um agente cidadania
  dataInicioAgente?: string; // Data de início como agente cidadania
}

export interface FiltrosMatricula {
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}
