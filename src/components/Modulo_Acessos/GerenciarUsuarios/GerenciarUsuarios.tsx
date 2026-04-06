import React, { useState, useEffect } from 'react';
import { acessoService } from '../services/acessoService';
import { Usuario } from '../types';
import styles from './GerenciarUsuarios.module.css';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo' | 'bloqueado'>('todos');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = () => {
    const usuariosCarregados = acessoService.obterUsuarios();
    setUsuarios(usuariosCarregados);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchFiltro = 
      usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtro.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;

    return matchFiltro && matchStatus;
  });

  const abrirFormularioNovo = () => {
    setUsuarioSelecionado(null);
    setModoEdicao(false);
    setMostrarFormulario(true);
  };

  const abrirFormularioEdicao = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModoEdicao(true);
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioSelecionado(null);
    setModoEdicao(false);
  };

  const handleSalvar = () => {
    carregarUsuarios();
    fecharFormulario();
  };

  const handleExcluir = (usuarioId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      acessoService.removerUsuario(usuarioId);
      carregarUsuarios();
    }
  };

  const handleAlterarStatus = (usuario: Usuario, novoStatus: Usuario['status']) => {
    const usuarioAtualizado = { ...usuario, status: novoStatus };
    acessoService.atualizarUsuario(usuarioAtualizado);
    carregarUsuarios();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerfilBadgeClass = (perfil: string) => {
    switch (perfil) {
      case 'admin': return styles.badgeAdmin;
      case 'usuario': return styles.badgeUsuario;
      case 'visitante': return styles.badgeVisitante;
      default: return '';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ativo': return styles.badgeAtivo;
      case 'inativo': return styles.badgeInativo;
      case 'bloqueado': return styles.badgeBloqueado;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciar Usuários</h1>
          <p className={styles.subtitle}>Gerencie os usuários do sistema</p>
        </div>
        <button onClick={abrirFormularioNovo} className={styles.addButton}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as any)}
          className={styles.filterSelect}
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <p>Nenhum usuário encontrado</p>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.userName}>{usuario.nome}</span>
                    </div>
                  </td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`${styles.badge} ${getPerfilBadgeClass(usuario.perfil)}`}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(usuario.status)}`}>
                      {usuario.status}
                    </span>
                  </td>
                  <td>
                    {usuario.ultimoAcesso ? formatarData(usuario.ultimoAcesso) : 'Nunca'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => abrirFormularioEdicao(usuario)}
                        className={styles.actionButton}
                        title="Editar"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {usuario.status === 'ativo' ? (
                        <button
                          onClick={() => handleAlterarStatus(usuario, 'inativo')}
                          className={`${styles.actionButton} ${styles.actionWarning}`}
                          title="Desativar"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAlterarStatus(usuario, 'ativo')}
                          className={`${styles.actionButton} ${styles.actionSuccess}`}
                          title="Ativar"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => handleExcluir(usuario.id)}
                        className={`${styles.actionButton} ${styles.actionDanger}`}
                        title="Excluir"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.summary}>
        <span>Total: {usuariosFiltrados.length} usuário(s)</span>
      </div>

      {mostrarFormulario && (
        <FormularioUsuario
          usuario={usuarioSelecionado}
          modoEdicao={modoEdicao}
          onSalvar={handleSalvar}
          onCancelar={fecharFormulario}
        />
      )}
    </div>
  );
}

// Componente interno de formulário
interface FormularioUsuarioProps {
  usuario: Usuario | null;
  modoEdicao: boolean;
  onSalvar: () => void;
  onCancelar: () => void;
}

function FormularioUsuario({ usuario, modoEdicao, onSalvar, onCancelar }: FormularioUsuarioProps) {
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    senha: '',
    confirmarSenha: '',
    perfil: usuario?.perfil || 'usuario' as const,
    status: usuario?.status || 'ativo' as const
  });
  const [erro, setErro] = useState('');

  const handleChange = (campo: string, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    setErro('');
  };

  const validarFormulario = (): boolean => {
    if (!formData.nome || !formData.email) {
      setErro('Preencha todos os campos obrigatórios');
      return false;
    }

    if (!modoEdicao && (!formData.senha || !formData.confirmarSenha)) {
      setErro('Senha é obrigatória para novos usuários');
      return false;
    }

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return false;
    }

    if (formData.senha && formData.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (modoEdicao && usuario) {
      const usuarioAtualizado: Usuario = {
        ...usuario,
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        status: formData.status,
        ...(formData.senha && { senha: formData.senha })
      };
      acessoService.atualizarUsuario(usuarioAtualizado);
    } else {
      acessoService.criarUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.perfil,
        status: formData.status
      });
    }

    onSalvar();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{modoEdicao ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button onClick={onCancelar} className={styles.closeButton}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {erro && <div className={styles.modalError}>{erro}</div>}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Nome Completo *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Senha {!modoEdicao && '*'}</label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                placeholder={modoEdicao ? 'Deixe vazio para manter' : '••••••••'}
                required={!modoEdicao}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Confirmar Senha {!modoEdicao && '*'}</label>
              <input
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                placeholder={modoEdicao ? 'Deixe vazio para manter' : '••••••••'}
                required={!modoEdicao}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Perfil *</label>
              <select
                value={formData.perfil}
                onChange={(e) => handleChange('perfil', e.target.value)}
                required
              >
                <option value="admin">Administrador</option>
                <option value="usuario">Usuário</option>
                <option value="visitante">Visitante</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                required
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onCancelar} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              {modoEdicao ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
