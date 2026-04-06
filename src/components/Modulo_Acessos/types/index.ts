// Tipos para o Módulo de Acessos

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: 'admin' | 'usuario' | 'visitante';
  status: 'ativo' | 'inativo' | 'bloqueado';
  dataCriacao: string;
  ultimoAcesso?: string;
}

export interface LoginCredenciais {
  email: string;
  senha: string;
}

export interface LoginResponse {
  sucesso: boolean;
  mensagem?: string;
  usuario?: Usuario;
  token?: string;
}

export interface FormularioUsuarioData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  perfil: 'admin' | 'usuario' | 'visitante';
}
