import React from 'react';
import { Matricula } from '../../types';
import styles from './Declaracao.module.css';
import { gerarDeclaracaoPDF } from '../../utils/pdfGenerator';

interface DeclaracaoMatriculaProps {
  matricula: Matricula;
  onVoltar: () => void;
}

export default function DeclaracaoMatricula({ matricula, onVoltar }: DeclaracaoMatriculaProps) {
  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarPDF = async () => {
    await gerarDeclaracaoPDF(matricula);
  };

  const obterMesAtual = () => {
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return meses[new Date().getMonth()];
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.toolbar}>
        <button onClick={onVoltar} className={styles.btnVoltar}>
          ← Voltar
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleBaixarPDF} className={styles.btnImprimir}>
            📥 Baixar PDF
          </button>
          <button onClick={handleImprimir} className={styles.btnImprimir}>
            Imprimir Declaração
          </button>
        </div>
      </div>

      <div className={styles.declaracao}>
        {/* Cabeçalho */}
        <div className={styles.cabecalho}>
          <div className={styles.logo}>
            <img 
              src="/Logo - centro da juventude.jpeg" 
              alt="Centro da Juventude Laranjeiras do Sul" 
              className={styles.logoImage}
              style={{ width: '120px', height: 'auto' }}
            />
          </div>
          <div className={styles.infoBox}>
            <strong>CENTRO DA JUVENTUDE</strong>
            <p>Avenida Governador Matto</p>
            <p>Laranjeiras do Sul - PR</p>
            <p style={{ fontSize: '9pt', marginTop: '8px' }}>
              Avenida Dr. Lamartine Pinto Avelar n° 1589, Bairro Cidade de Deus
            </p>
            <p style={{ fontSize: '9pt' }}>CEP: 85.305-000</p>
            <p style={{ fontSize: '9pt' }}>
              Telefone: (42) 3619-4706 - Ramal 8192
            </p>
            <p style={{ fontSize: '9pt' }}>WhatsApp: (42) 3672-3891 RE</p>
          </div>
        </div>

        {/* Título */}
        <h1 className={styles.titulo}>DECLARAÇÃO DE MATRÍCULA</h1>

        {/* Corpo da declaração */}
        <div className={styles.corpo}>
          <p className={styles.paragrafo}>
            Eu, <span className={styles.preenchido}>{matricula.nomeResponsavel || '_'.repeat(50)}</span>, 
            portador do RG/CPF: <span className={styles.preenchido}>
              {matricula.rgMae && matricula.nomeResponsavel === matricula.nomeMae 
                ? `${matricula.rgMae}/${matricula.ufMae}` 
                : matricula.rgPai && matricula.nomeResponsavel === matricula.nomePai 
                ? `${matricula.rgPai}/${matricula.ufPai}` 
                : '_'.repeat(20)}
            </span>, na qualidade de responsável pelo menor{' '}
            <span className={styles.preenchido}>{matricula.nomeCompleto}</span>, venho por meio desta AUTORIZAR a matrícula 
            do menor citado, podendo participar de atividades propostas pelo Centro da Juventude Eventuais 
            de Laranjeiras do Sul, nos horários combinados previamente constantes das normas e regras 
            que a instituição preconiza, para o bom convívio entre os alunos e professores.
          </p>

          <p className={styles.paragrafo}>
            Declaro autorizar, a título gratuito, o uso eventual de imagem pelo Centro da Juventude, 
            para fins de divulgação da instituição e de suas atividades, podendo tanto republicá-la 
            ou divulgá-la junto à internet, jornais e a todos os demais meios de comunicação, 
            públicos e privados, durante todo o período que o mesmo estiver matriculado. 
            Em hipótese alguma poderá a imagem ser utilizada de maneira contrária à boa, 
            aos bons costumes e à ordem pública.
          </p>

          {/* Data e Local */}
          <div className={styles.dataLocal}>
            <p>
              Laranjeiras do Sul, <span className={styles.linhaPreenchimento}>
                {new Date().getDate()}
              </span> de <span className={styles.linhaPreenchimento}>
                {obterMesAtual()}
              </span> de <span className={styles.linhaPreenchimento}>
                {new Date().getFullYear()}
              </span>
            </p>
          </div>

          {/* Assinatura */}
          <div className={styles.assinatura}>
            <div className={styles.linhaAssinatura}></div>
            <p className={styles.labelAssinatura}>Responsável</p>
          </div>
        </div>

        {/* Informações adicionais (não impressas) */}
        <div className={styles.infoAdicionais}>
          <h3>Dados da Matrícula</h3>
          <p><strong>Aluno:</strong> {matricula.nomeCompleto}</p>
          <p><strong>CPF:</strong> {matricula.cpf}</p>
          <p><strong>Responsável:</strong> {matricula.nomeResponsavel}</p>
          <p><strong>Parentesco:</strong> {matricula.parentesco}</p>
          <p><strong>Matrícula Nº:</strong> {matricula.id}</p>
        </div>
      </div>
    </div>
  );
}
