import React from 'react';
import { Matricula } from '../../types';
import styles from './FichaNatacao.module.css';
import { gerarFichaNatacaoPDF } from '../../utils/pdfGenerator';

// Função helper para calcular idade completa
const calcularIdadeCompleta = (dataNasc: string) => {
  const hoje = new Date();
  const nascimento = new Date(dataNasc);
  
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  let dias = hoje.getDate() - nascimento.getDate();
  
  // Ajustar dias negativos
  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  
  // Ajustar meses negativos
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  // Construir o texto da idade
  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  
  return partes.length > 0 ? partes.join(', ') : '0 dias';
};

interface FichaNatacaoProps {
  matricula: Matricula;
  onVoltar: () => void;
}

export default function FichaNatacao({ matricula, onVoltar }: FichaNatacaoProps) {
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  const handleBaixarPDF = async () => {
    await gerarFichaNatacaoPDF(matricula);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Barra de ferramentas (oculta na impressão) */}
      <div className={styles.toolbar}>
        <h2>Ficha de Inscrição - Oficina de Natação</h2>
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
          <div className={styles.logo}>
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
          <div className={styles.photoBox}>
            <span>FOTO</span>
          </div>
        </div>

        {/* Título */}
        <h1 className={styles.title}>FICHA DE INSCRIÇÃO OFICINA DE NATAÇÃO</h1>

        {/* Formulário */}
        <div className={styles.formContent}>
          {/* Data */}
          <div className={styles.formRow}>
            <label>DATA:</label>
            <span className={styles.underline}>{dataAtual}</span>
          </div>

          {/* Nome */}
          <div className={styles.formRow}>
            <label>NOME:</label>
            <span className={styles.underline}>{matricula.nomeCompleto}</span>
          </div>

          {/* Data de Nascimento e Idade */}
          <div className={styles.formRow}>
            <label>DATA DE NASCIMENTO:</label>
            <span className={styles.underline}>
              {new Date(matricula.dataNascimento).toLocaleDateString('pt-BR')}
            </span>
            <label style={{ marginLeft: '20px' }}>IDADE:</label>
            <span className={styles.underline}>{calcularIdadeCompleta(matricula.dataNascimento)}</span>
          </div>

          {/* Pai */}
          <div className={styles.formRow}>
            <label>PAI:</label>
            <span className={styles.underline}>{matricula.nomePai || ''}</span>
          </div>

          {/* Mãe */}
          <div className={styles.formRow}>
            <label>MÃE:</label>
            <span className={styles.underline}>{matricula.nomeMae || ''}</span>
          </div>

          {/* Endereço */}
          <div className={styles.formRow}>
            <label>ENDEREÇO:</label>
            <span className={styles.underline}>
              {matricula.endereco}, {matricula.numeroEndereco} - {matricula.bairro}, {matricula.municipio}/{matricula.uf}
            </span>
          </div>

          {/* Telefone e Email */}
          <div className={styles.formRow}>
            <label>TELEFONE - CELULAR:</label>
            <span className={styles.underline}>{matricula.telefone || ''}</span>
            <label style={{ marginLeft: '20px' }}>E-mail:</label>
            <span className={styles.underline}></span>
          </div>

          {/* Caso de urgência */}
          <div className={styles.formRow}>
            <label>CASO DE URGÊNCIA CHAMAR:</label>
            <span className={styles.underline}>{matricula.nomeResponsavel || ''}</span>
            <label style={{ marginLeft: '20px' }}>TEL.:</label>
            <span className={styles.underline}>{matricula.telefoneOutro || ''}</span>
          </div>

          {/* Frequenta escola */}
          <div className={styles.formRow}>
            <label>FREQUENTA ESCOLA?</label>
            <span>SIM ( ) NÃO ( )</span>
            <label style={{ marginLeft: '20px' }}>SÉRIE:</label>
            <span className={styles.underline}>{matricula.serie || ''}</span>
          </div>

          {/* Colégio */}
          <div className={styles.formRow}>
            <label>Colégio:</label>
            <span className={styles.underline}>{matricula.escola || ''}</span>
          </div>

          {/* Turno */}
          <div className={styles.formRow}>
            <label>Turno:</label>
            <span>Manhã ( ) Tarde ( ) Noite ( )</span>
          </div>

          {/* ATENÇÃO - Seção de saúde */}
          <div className={styles.attentionSection}>
            <h3>ATENÇÃO:</h3>
            
            <div className={styles.formRow}>
              <label>Tem problema de Saúde:</label>
              <span>SIM ( ) NÃO ( )</span>
              <span style={{ marginLeft: '10px' }}>se for SIM, descrever abaixo OBS:</span>
            </div>

            <div className={styles.blankLine}></div>
            <div className={styles.blankLine}></div>

            {/* Tipo sanguíneo, Altura, Peso */}
            <div className={styles.formRow}>
              <label>Tipo Sanguíneo:</label>
              <span className={styles.underline}></span>
              <label style={{ marginLeft: '20px' }}>Altura:</label>
              <span className={styles.underline}></span>
              <label style={{ marginLeft: '20px' }}>Peso:</label>
              <span className={styles.underline}></span>
            </div>

            {/* Alergias a medicamentos */}
            <div className={styles.formRow}>
              <label>Alergia a Medicamentos:</label>
              <span>Sim ( ) Não ( )</span>
              <label style={{ marginLeft: '10px' }}>Qual:</label>
              <span className={styles.underline}></span>
            </div>

            {/* Alergias a outras coisas */}
            <div className={styles.formRow}>
              <label>Alergia a outras coisas:</label>
              <span>Sim ( ) Não ( )</span>
              <label style={{ marginLeft: '10px' }}>Qual:</label>
              <span className={styles.underline}></span>
            </div>

            {/* Medicação habitual */}
            <div className={styles.formRow}>
              <label>Tem que tomar alguma medicação habitual?</label>
              {matricula.usaRemediosControlados ? (
                <>
                  <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>SIM</span>
                  {matricula.observacaoRemedios && (
                    <div style={{ marginTop: '5px', marginLeft: '10px', fontSize: '10pt' }}>
                      <strong>Medicação:</strong> {matricula.observacaoRemedios}
                    </div>
                  )}
                </>
              ) : (
                <span className={styles.underline}></span>
              )}
            </div>
          </div>

          {/* Assinatura */}
          <div className={styles.signatureSection}>
            <div className={styles.signatureLine}></div>
            <p className={styles.signatureLabel}>ASSINATURA DOS PAIS OU RESPONSÁVEIS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
