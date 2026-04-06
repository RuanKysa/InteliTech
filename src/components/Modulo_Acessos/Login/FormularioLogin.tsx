import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { acessoService } from '../services/acessoService';
import { LoginCredenciais } from '../types';
import styles from './FormularioLogin.module.css';

interface FormularioLoginProps {
  onLoginSucesso?: () => void;
  redirecionarPara?: string;
}

export default function FormularioLogin({ 
  onLoginSucesso, 
  redirecionarPara = '/' 
}: FormularioLoginProps) {
  const [credenciais, setCredenciais] = useState<LoginCredenciais>({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const router = useRouter();

  const handleChange = (campo: keyof LoginCredenciais, valor: string) => {
    setCredenciais(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Limpa erro ao digitar
    if (erro) setErro('');
  };

  const validarFormulario = (): boolean => {
    if (!credenciais.email || !credenciais.senha) {
      setErro('Por favor, preencha todos os campos');
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credenciais.email)) {
      setErro('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);

    try {
      // Valida credenciais no backend (ou serviço)
      const response = await acessoService.validarCredenciais(credenciais);

      if (response.sucesso && response.usuario) {
        // Salva dados do usuário no localStorage
        localStorage.setItem('@sistema:user', JSON.stringify(response.usuario));
        if (response.token) {
          localStorage.setItem('@sistema:token', response.token);
        }

        // Callback de sucesso
        if (onLoginSucesso) {
          onLoginSucesso();
        }

        // Redireciona para dashboard
        router.push(redirecionarPara);
      } else {
        // Exibe mensagem de erro
        setErro(response.mensagem || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={styles.title}>Bem-vindo de Volta</h1>
          <p className={styles.subtitle}>Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && (
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {erro}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputContainer}>
              <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <input
                type="email"
                id="email"
                value={credenciais.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={styles.input}
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={carregando}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senha" className={styles.label}>
              Senha
            </label>
            <div className={styles.inputContainer}>
              <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                value={credenciais.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={carregando}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className={styles.togglePassword}
                disabled={carregando}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={carregando}
          >
            {carregando ? (
              <>
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <div className={styles.credentialsInfo}>
            <h4>📝 Credenciais de Teste</h4>
            <div className={styles.credentialsList}>
              <div className={styles.credentialItem}>
                <strong>Admin:</strong> <code>admin@sistema.com</code> / <code>admin123</code>
              </div>
              <div className={styles.credentialItem}>
                <strong>Usuário:</strong> <code>usuario@sistema.com</code> / <code>user123</code>
              </div>
              <div className={styles.credentialItem}>
                <strong>Visitante:</strong> <code>visitante@sistema.com</code> / <code>visitante123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
