import React, { useState, useEffect } from 'react';
import GerenciarOficinas from './components/GerenciarOficinas';
import DistribuirAlunos from './components/DistribuirAlunos';
import GerenciarPessoas from './components/GerenciarPessoas';
import VisualizarOficina from './components/VisualizarOficina';
import { oficinaService, responsavelService, agentesCidadaniaService } from './services/oficinaService';
import { ResumoOficina } from './types';
import styles from './styles/ModuloOficinas.module.css';

type Visualizacao = 'dashboard' | 'gerenciar_oficinas' | 'distribuir_alunos' | 'gerenciar_pessoas' | 'visualizar_oficina';

export default function ModuloOficinas() {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('dashboard');
  const [oficinaIdSelecionada, setOficinaIdSelecionada] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoOficina>({
    totalOficinas: 0,
    oficinasAtivas: 0,
    totalVagas: 0,
    vagasOcupadas: 0,
    alunosInscritos: 0,
    responsaveisAtivos: 0,
    agentesCidadaniaAtivos: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visualizacao === 'dashboard') {
      carregarResumo();
    }
  }, [visualizacao]);

  const carregarResumo = async () => {
    setLoading(true);
    try {
      const resumoData = await oficinaService.obterResumo();
      setResumo(resumoData);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConteudo = () => {
    switch (visualizacao) {
      case 'gerenciar_oficinas':
        return (
          <GerenciarOficinas
            onVoltar={() => setVisualizacao('dashboard')}
            onVisualizarOficina={abrirVisualizacaoOficina}
          />
        );
      case 'distribuir_alunos':
        return <DistribuirAlunos onVoltar={() => setVisualizacao('dashboard')} />;
      case 'gerenciar_pessoas':
        return <GerenciarPessoas onVoltar={() => setVisualizacao('dashboard')} />;
      case 'visualizar_oficina':
        return oficinaIdSelecionada ? (
          <VisualizarOficina
            oficinaId={oficinaIdSelecionada}
            onVoltar={() => {
              setVisualizacao('dashboard');
              setOficinaIdSelecionada(null);
              carregarResumo(); // Recarregar resumo ao voltar
            }}
          />
        ) : null;
      default:
        return renderDashboard();
    }
  };

  const abrirVisualizacaoOficina = (oficinaId: string) => {
    setOficinaIdSelecionada(oficinaId);
    setVisualizacao('visualizar_oficina');
  };

  const renderDashboard = () => {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Módulo de Oficinas</h1>
          <p>Gerencie oficinas, responsáveis, agentes cidadania e distribua alunos por horários</p>
        </div>

        {/* Cards de Resumo */}
        <div className={styles.resumo}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🎨</div>
            <div className={styles.cardInfo}>
              <h3>Oficinas</h3>
              <p className={styles.numero}>{resumo.totalOficinas}</p>
              <p className={styles.detalhe}>{resumo.oficinasAtivas} ativas</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <div className={styles.cardInfo}>
              <h3>Alunos Inscritos</h3>
              <p className={styles.numero}>{resumo.alunosInscritos}</p>
              <p className={styles.detalhe}>
                {resumo.vagasOcupadas} de {resumo.totalVagas} vagas
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>👨‍🏫</div>
            <div className={styles.cardInfo}>
              <h3>Responsáveis</h3>
              <p className={styles.numero}>{resumo.responsaveisAtivos}</p>
              <p className={styles.detalhe}>Professores/Estagiários</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🤝</div>
            <div className={styles.cardInfo}>
              <h3>Agentes Cidadania</h3>
              <p className={styles.numero}>{resumo.agentesCidadaniaAtivos}</p>
              <p className={styles.detalhe}>Ativos</p>
            </div>
          </div>
        </div>

        {/* Ações Principais */}
        <div className={styles.acoes}>
          <button
            className={styles.botaoAcao}
            onClick={() => setVisualizacao('gerenciar_pessoas')}
          >
            <span className={styles.icone}>👤</span>
            <div>
              <h3>Gerenciar Pessoas</h3>
              <p>Responsáveis e Agentes Cidadania</p>
            </div>
          </button>
          <button
            className={styles.botaoAcao}
            onClick={() => setVisualizacao('gerenciar_oficinas')}
          >
            <span className={styles.icone}>📋</span>
            <div>
              <h3>Gerenciar Oficinas</h3>
              <p>Criar, editar e excluir oficinas</p>
            </div>
          </button>
          <button
            className={styles.botaoAcao}
            onClick={() => setVisualizacao('distribuir_alunos')}
          >
            <span className={styles.icone}>📅</span>
            <div>
              <h3>Distribuir Alunos</h3>
              <p>Adicionar alunos aos horários das oficinas</p>
            </div>
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className={styles.informacoes}>
          <div className={styles.infoCard}>
            <h3>💡 Dicas</h3>
            <ul>
              <li>Crie oficinas e defina os horários disponíveis</li>
              <li>Atribua responsáveis (professores/estagiários) às oficinas</li>
              <li>Distribua os alunos matriculados pelos horários</li>
              <li>Cadastre os agentes cidadania que auxiliam nas atividades</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>📊 Estatísticas</h3>
            <ul>
              <li>Taxa de ocupação: {resumo.totalVagas > 0
                ? Math.round((resumo.vagasOcupadas / resumo.totalVagas) * 100)
                : 0}%</li>
              <li>Vagas disponíveis: {resumo.totalVagas - resumo.vagasOcupadas}</li>
              <li>Média de alunos por oficina: {resumo.oficinasAtivas > 0
                ? Math.round(resumo.alunosInscritos / resumo.oficinasAtivas)
                : 0}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderConteudo()}
    </div>
  );
}
