import React from 'react';
import { Matricula } from '../../types';
import styles from './RenovacaoMatricula.module.css';
import { gerarRenovacaoPDF } from '../../utils/pdfGenerator';

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

interface RenovacaoMatriculaProps {
  matricula: Matricula;
  onVoltar: () => void;
}

export default function RenovacaoMatricula({ matricula, onVoltar }: RenovacaoMatriculaProps) {
  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarPDF = async () => {
    await gerarRenovacaoPDF(matricula);
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
            🖨️ Imprimir Renovação
          </button>
        </div>
      </div>

      <div className={styles.formulario}>
        {/* Cabeçalho */}
        <div className={styles.cabecalho}>
          <div className={styles.logo}>
            <img 
              src="/Logo - centro da juventude.jpeg" 
              alt="Centro da Juventude Laranjeiras do Sul" 
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
        <h1 className={styles.titulo}>Formulário de Renovação de Matrícula</h1>

        {/* Dados da Criança/Adolescente */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campo} style={{ flex: 3 }}>
              <label>Nome da criança/adolescente:</label>
              <div className={styles.valor}>{matricula.nomeCompleto}</div>
            </div>
            <div className={styles.campo} style={{ flex: 1 }}>
              <label>Idade:</label>
              <div className={styles.valor}>{calcularIdadeCompleta(matricula.dataNascimento)}</div>
            </div>
          </div>
          
          <div className={styles.linha}>
            <div className={styles.campo}>
              <label>CPF:</label>
              <div className={styles.valor}>{matricula.cpf}</div>
            </div>
            <div className={styles.campo}>
              <label>NIS:</label>
              <div className={styles.valor}>{matricula.cadUnicoAluno || ''}</div>
            </div>
          </div>
        </div>

        {/* Dados do Responsável */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campo} style={{ flex: 2 }}>
              <label>Nome do responsável:</label>
              <div className={styles.valor}>{matricula.nomeResponsavel}</div>
            </div>
          </div>
          
          <div className={styles.linha}>
            <div className={styles.campo}>
              <label>CPF:</label>
              <div className={styles.valor}>{matricula.rgMae && matricula.nomeResponsavel === matricula.nomeMae ? '' : ''}</div>
            </div>
            <div className={styles.campo}>
              <label>NIS:</label>
              <div className={styles.valor}>{matricula.cadUnicoResponsavel || ''}</div>
            </div>
          </div>

          <div className={styles.linha}>
            <div className={styles.campo} style={{ flex: 3 }}>
              <label>Endereço:</label>
              <div className={styles.valor}>
                {matricula.endereco}{matricula.numeroEndereco ? `, ${matricula.numeroEndereco}` : ''}
                {matricula.complemento ? ` - ${matricula.complemento}` : ''}
                {matricula.bairro ? ` - ${matricula.bairro}` : ''}
              </div>
            </div>
          </div>

          <div className={styles.linha}>
            <div className={styles.campo}>
              <label>Telefone:</label>
              <div className={styles.valor}>{matricula.telefone}</div>
            </div>
          </div>
        </div>

        {/* Escola */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campo} style={{ flex: 2 }}>
              <label>Escola:</label>
              <div className={styles.valor}>{matricula.escola || ''}</div>
            </div>
            <div className={styles.campo}>
              <label>Série:</label>
              <div className={styles.valor}>{matricula.serie || ''}</div>
            </div>
            <div className={styles.campo}>
              <label>Turno:</label>
              <div className={styles.valor}>{matricula.turno || ''}</div>
            </div>
          </div>
        </div>

        {/* Turno SCFV */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campoInline}>
              <label>Turno SCFV/CEJU:</label>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={matricula.turnoSCFV === 'manha'} readOnly />
                Manhã ( )
              </span>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={matricula.turnoSCFV === 'tarde'} readOnly />
                Tarde ( )
              </span>
            </div>
          </div>
        </div>

        {/* Utiliza transporte */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campoInline}>
              <label>Utiliza transporte:</label>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={!matricula.utilizaTransporte} readOnly />
                Não ( )
              </span>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={matricula.utilizaTransporte} readOnly />
                Sim, embarque:
              </span>
              <div className={styles.valorInline}>{matricula.localEmbarque || ''}</div>
              <label>Desembarque:</label>
              <div className={styles.valorInline}>{matricula.localDesembarque || ''}</div>
            </div>
          </div>
        </div>

        {/* Almoço */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campoInline}>
              <label>Almoço:</label>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={matricula.almoco} readOnly />
                Sim ( )
              </span>
              <span className={styles.checkbox}>
                <input type="checkbox" checked={!matricula.almoco} readOnly />
                Não
              </span>
            </div>
          </div>
        </div>

        {/* Demanda espontânea */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campoInline}>
              <label>Demanda espontânea: ( )</label>
              <label>Sim ( )</label>
              <label>Não, encaminhado por:</label>
              <div className={styles.valorInline}>{matricula.encaminhadoPor || ''}</div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className={styles.secao}>
          <div className={styles.linha}>
            <div className={styles.campo}>
              <label>Observações:</label>
              <div className={styles.valorMultilinha}>{matricula.observacoes || ''}</div>
            </div>
          </div>
        </div>

        {/* Necessidade de atualizar documentação */}
        <div className={styles.secao}>
          <h3 className={styles.subtitulo}>Necessidade de atualizar documentação:</h3>
          
          <div className={styles.listaDocumentos}>
            <div className={styles.itemDocumento}>
              <label>Folha Resumo (dentro da validade)</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>RG da criança/adolescente</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>CPF da criança/adolescente</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>RG do responsável</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>CPF do responsável</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>Certidão de nascimento</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>Comprovante de Residência</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>Declaração de matrícula escolar</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>Certificado de vacina</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>

            <div className={styles.itemDocumento}>
              <label>Cartão do SUS</label>
              <span className={styles.opcoes}>
                <span>( ) Sim</span>
                <span>( ) Não</span>
              </span>
            </div>
          </div>
        </div>

        {/* Data e Assinaturas */}
        <div className={styles.secaoFinal}>
          <p className={styles.dataLocal}>
            Laranjeiras do Sul - PR, _____ de _____________ de 2026.
          </p>

          <div className={styles.assinaturas}>
            <div className={styles.assinatura}>
              <div className={styles.linha}></div>
              <p>Responsável</p>
            </div>

            <div className={styles.assinatura}>
              <div className={styles.linha}></div>
              <p>Profissional de Referência</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
