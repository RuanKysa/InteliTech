import React from 'react';
import { Matricula } from '../../types';
import styles from './SolicitacaoDesistencia.module.css';
import { gerarDesistenciaPDF } from '../../utils/pdfGenerator';

interface SolicitacaoDesistenciaProps {
  matricula: Matricula;
  onVoltar: () => void;
}

export default function SolicitacaoDesistencia({ matricula, onVoltar }: SolicitacaoDesistenciaProps) {
  const dataAtual = new Date();
  const dia = dataAtual.getDate();
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mes = meses[dataAtual.getMonth()];
  const ano = dataAtual.getFullYear();

  const handleBaixarPDF = async () => {
    await gerarDesistenciaPDF(matricula);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Barra de ferramentas (oculta na impressão) */}
      <div className={styles.toolbar}>
        <h2>Solicitação de Desistência de Matrícula</h2>
        <div className={styles.toolbarButtons}>
          <button onClick={handleBaixarPDF} className={styles.buttonPrimary}>
            📥 Baixar PDF
          </button>
          <button onClick={() => window.print()} className={styles.buttonPrimary}>
            🖨️ Imprimir
          </button>
          <button onClick={onVoltar} className={styles.buttonSecondary}>
            Voltar
          </button>
        </div>
      </div>

      {/* Documento A4 para impressão */}
      <div className={styles.a4Page}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div className={styles.logoSection}>
            <img 
              src="/Logo - centro da juventude.jpeg" 
              alt="Centro da Juventude Laranjeiras do Sul" 
              style={{ width: '120px', height: 'auto' }}
            />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.yellowBox}>
              <strong>CENTRO DA JUVENTUDE</strong>
              <p>Avenida Governador Matto</p>
              <p>Laranjeiras do Sul - PR</p>
              <p style={{ fontSize: '8pt', marginTop: '5px' }}>
                Avenida Dr. Lamartine Pinto Avelar n° 1589, Bairro Cidade de Deus
              </p>
              <p style={{ fontSize: '8pt' }}>CEP: 85.305-000</p>
              <p style={{ fontSize: '8pt' }}>
                Telefone: (42) 3619-4706 - Ramal 8192
              </p>
              <p style={{ fontSize: '8pt' }}>WhatsApp: (42) 3672-3891 RE</p>
            </div>
          </div>
        </div>

        {/* Título */}
        <h1 className={styles.title}>Solicitação de Desistência de Matrícula</h1>

        {/* Conteúdo do formulário */}
        <div className={styles.formContent}>
          {/* Primeira linha - Responsável */}
          <div className={styles.textLine}>
            <span>Eu</span>
            <span className={styles.underline}>{matricula.nomeResponsavel}</span>
            <span className={styles.spacer}>RG/CPF</span>
            <span className={styles.underline}>{matricula.cpf}</span>
          </div>

          {/* Segunda linha - Criança */}
          <div className={styles.textLine}>
            <span>responsável pela criança/adolescente</span>
            <span className={styles.underline}>{matricula.nomeCompleto}</span>
          </div>

          {/* Terceira linha - RG/CPF criança */}
          <div className={styles.textLine}>
            <span>RG/CPF n°</span>
            <span className={styles.underline}>{matricula.rg}</span>
          </div>

          {/* Solicitação */}
          <div className={styles.textLine} style={{ marginTop: '15px' }}>
            <span>solicito a desistência da matrícula do mesmo(a) no Serviço de Convivência e</span>
          </div>

          <div className={styles.textLine}>
            <span>Fortalecimento de Vínculos, pelos motivos:</span>
            <span className={styles.underlineLong}></span>
          </div>

          <div className={styles.blankLine}></div>
          <div className={styles.blankLine}></div>

          {/* Texto informativo */}
          <div className={styles.infoText}>
            <p>
              Fico ciente que, uma vez que desista da vaga, a mesma será direcionada para 
              outra criança/adolescente que atenda aos critérios de inclusão do SCFV, sendo que foi 
              esclarecido(a) que a qualquer tempo posso estar solicitando a nova reavaliação para 
              inserção no serviço mediante disponibilidade de vaga.
            </p>
          </div>

          {/* Data */}
          <div className={styles.dateSection}>
            <span>Laranjeiras do Sul,</span>
            <span className={styles.underlineShort}>{dia}</span>
            <span>de</span>
            <span className={styles.underlineShort}>{mes}</span>
            <span>de 20</span>
            <span className={styles.underlineShort}>{ano.toString().substring(2)}</span>
          </div>

          {/* Assinaturas */}
          <div className={styles.signaturesSection}>
            <div className={styles.signatureBlock}>
              <div className={styles.signatureLine}></div>
              <p className={styles.signatureLabel}>Assinatura do Responsável legal</p>
            </div>

            <div className={styles.signatureBlock}>
              <div className={styles.signatureLine}></div>
              <p className={styles.signatureLabel}>Assinatura do Responsável pelo Atendimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
