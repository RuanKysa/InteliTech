import { Usuario, LoginCredenciais, LoginResponse } from '../types';

// Dados de exemplo - Em produção, estes viriam de uma API/Backend
const USUARIOS_MOCK: Usuario[] = [
  {
    id: '1',
    nome: 'Administrador',
    email: 'admin@sistema.com',
    senha: 'admin123',
    perfil: 'admin',
    status: 'ativo',
    dataCriacao: '2024-01-01T00:00:00Z',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Usuário Teste',
    email: 'usuario@sistema.com',
    senha: 'user123',
    perfil: 'usuario',
    status: 'ativo',
    dataCriacao: '2024-01-15T00:00:00Z',
    ultimoAcesso: '2024-02-20T10:30:00Z'
  },
  {
    id: '3',
    nome: 'Visitante Teste',
    email: 'visitante@sistema.com',
    senha: 'visitante123',
    perfil: 'visitante',
    status: 'ativo',
    dataCriacao: '2024-02-01T00:00:00Z',
  }
];

class AcessoService {
  private usuarios: Usuario[] = [];

  constructor() {
    // Inicializa com dados mockados
    if (typeof window !== 'undefined') {
      const usuariosSalvos = localStorage.getItem('@sistema:usuarios');
      this.usuarios = usuariosSalvos ? JSON.parse(usuariosSalvos) : USUARIOS_MOCK;
    }
  }

  /**
   * Valida as credenciais do usuário
   */
  async validarCredenciais(credenciais: LoginCredenciais): Promise<LoginResponse> {
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      const usuario = this.usuarios.find(
        u => u.email.toLowerCase() === credenciais.email.toLowerCase()
      );

      if (!usuario) {
        return {
          sucesso: false,
          mensagem: 'Email ou senha incorretos'
        };
      }

      if (usuario.status !== 'ativo') {
        return {
          sucesso: false,
          mensagem: `Usuário ${usuario.status}. Entre em contato com o administrador.`
        };
      }

      if (usuario.senha !== credenciais.senha) {
        return {
          sucesso: false,
          mensagem: 'Email ou senha incorretos'
        };
      }

      // Login bem-sucedido
      usuario.ultimoAcesso = new Date().toISOString();
      this.atualizarUsuario(usuario);

      // Remove a senha do objeto retornado
      const { senha, ...usuarioSemSenha } = usuario;

      return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        usuario: usuarioSemSenha,
        token: this.gerarToken(usuario)
      };

    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      return {
        sucesso: false,
        mensagem: 'Erro ao processar login. Tente novamente.'
      };
    }
  }

  /**
   * Obtém todos os usuários (sem senhas)
   */
  obterUsuarios(): Usuario[] {
    return this.usuarios.map(({ senha, ...usuario }) => usuario);
  }

  /**
   * Cria um novo usuário
   */
  criarUsuario(usuario: Omit<Usuario, 'id' | 'dataCriacao' | 'ultimoAcesso'>): Usuario {
    const novoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString()
    };

    this.usuarios.push(novoUsuario);
    this.salvarUsuarios();

    return novoUsuario;
  }

  /**
   * Atualiza um usuário existente
   */
  atualizarUsuario(usuario: Usuario): void {
    const index = this.usuarios.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      this.usuarios[index] = usuario;
      this.salvarUsuarios();
    }
  }

  /**
   * Remove um usuário
   */
  removerUsuario(usuarioId: string): boolean {
    const index = this.usuarios.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      this.salvarUsuarios();
      return true;
    }
    return false;
  }

  /**
   * Salva usuários no localStorage
   */
  private salvarUsuarios(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('@sistema:usuarios', JSON.stringify(this.usuarios));
    }
  }

  /**
   * Gera um token de autenticação (simplificado)
   */
  private gerarToken(usuario: Usuario): string {
    // Em produção, usar JWT ou similar
    const payload = {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(payload));
  }
}

// Singleton instance
export const acessoService = new AcessoService();
