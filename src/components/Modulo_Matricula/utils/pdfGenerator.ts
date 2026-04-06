import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Matricula } from '../types';

// Registrar as fontes virtuais do pdfMake
(pdfMake as any).vfs = pdfFonts;

// Função auxiliar para calcular idade completa
const calcularIdadeCompleta = (dataNasc: string) => {
  const hoje = new Date();
  const nascimento = new Date(dataNasc);
  
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  let dias = hoje.getDate() - nascimento.getDate();
  
  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  
  return partes.length > 0 ? partes.join(', ') : '0 dias';
};

// Função auxiliar para formatar data
const formatarData = (data: Date | string) => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
};

// Função para carregar imagem e converter para base64
const carregarImagemBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    return '';
  }
};

// Estilos padrão
const estilosPadrao = {
  header: {
    fontSize: 14,
    bold: true,
    alignment: 'center' as const,
    margin: [0, 0, 0, 10] as [number, number, number, number]
  },
  subheader: {
    fontSize: 12,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  texto: {
    fontSize: 11,
    alignment: 'justify' as const,
    margin: [0, 5, 0, 5] as [number, number, number, number]
  },
  campo: {
    fontSize: 10,
    margin: [0, 2, 0, 2] as [number, number, number, number]
  }
};

// 1. Gerar PDF da Declaração de Matrícula
export const gerarDeclaracaoPDF = async (matricula: Matricula) => {
  // Carregar a logo
  const logoBase64 = await carregarImagemBase64('/Logo - centro da juventude.jpeg');
  
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Cabeçalho com tabela
      {
        table: {
          widths: [100, '*'],
          body: [
            [
              {
                image: logoBase64,
                width: 80,
                alignment: 'center',
                margin: [10, 10, 10, 10],
                border: [true, true, false, true]
              },
              {
                stack: [
                  { text: 'CENTRO DA JUVENTUDE', fontSize: 12, bold: true, alignment: 'center' },
                  { text: 'Avenida Governador Matto', fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0] },
                  { text: 'Laranjeiras do Sul - PR', fontSize: 9, alignment: 'center' },
                  { text: 'Avenida Dr. Lamartine Pinto Avelar nº 1589, Bairro Cidade de Deus', fontSize: 8, alignment: 'center', margin: [0, 4, 0, 0] },
                  { text: 'CEP: 85.305-000', fontSize: 8, alignment: 'center' },
                  { text: 'Telefone: (42) 3619-4706 - Ramal 8192', fontSize: 8, alignment: 'center' },
                  { text: 'WhatsApp: (42) 3672-3891 RE', fontSize: 8, alignment: 'center' }
                ],
                fillColor: '#FFD700',
                margin: [10, 5, 10, 5],
                border: [false, true, true, true]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: true,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5
        },
        margin: [0, 0, 0, 20]
      },
      
      // Título
      { 
        text: 'DECLARAÇÃO DE MATRÍCULA', 
        fontSize: 16, 
        bold: true, 
        alignment: 'center',
        decoration: 'underline', 
        margin: [0, 10, 0, 30] 
      },
      
      // Corpo
      {
        text: [
          { text: 'Eu, ', fontSize: 11 },
          { text: matricula.nomeResponsavel, fontSize: 11, bold: true, decoration: 'underline' },
          { text: ', portador do RG/CPF: ', fontSize: 11 },
          { text: `${matricula.rgMae || matricula.rgPai || '___________'}/${matricula.ufMae || matricula.ufPai || '__'}`, fontSize: 11, bold: true, decoration: 'underline' },
          { text: ', na qualidade de responsável pelo menor ', fontSize: 11 },
          { text: matricula.nomeCompleto, fontSize: 11, bold: true, decoration: 'underline' },
          { text: ', venho por meio desta AUTORIZAR a matrícula do menor citado, podendo participar de atividades propostas pelo Centro da Juventude Eventuais de Laranjeiras do Sul, nos horários combinados previamente constantes das normas e regras que a instituição preconiza, para o bom convívio entre os alunos e professores.', fontSize: 11 }
        ],
        alignment: 'justify',
        lineHeight: 1.5,
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Declaro autorizar, a título gratuito, o uso eventual de imagem pelo Centro da Juventude, para fins de divulgação da instituição e de suas atividades, podendo tanto republicá-la ou divulgá-la junto à internet, jornais e a todos os demais meios de comunicação, públicos e privados, durante todo o período que o mesmo estiver matriculado. Em hipótese alguma poderá a imagem ser utilizada de maneira contrária à boa, aos bons costumes e à ordem pública.',
        fontSize: 11,
        alignment: 'justify',
        lineHeight: 1.5,
        margin: [0, 0, 0, 50]
      },
      
      // Data
      {
        text: `Laranjeiras do Sul, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.`,
        fontSize: 11,
        margin: [0, 0, 0, 80]
      },
      
      // Assinatura
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 250,
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do(a) Responsável', alignment: 'center', fontSize: 10, margin: [0, 5, 0, 0] }
            ]
          },
          { width: '*', text: '' }
        ]
      }
    ]
  };

  pdfMake.createPdf(docDefinition).download(`Declaracao_${matricula.nomeCompleto}.pdf`);
};

// 2. Gerar PDF da Renovação de Matrícula
export const gerarRenovacaoPDF = async (matricula: Matricula) => {
  // Carregar a logo
  const logoBase64 = await carregarImagemBase64('/Logo - centro da juventude.jpeg');
  
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    content: [
      // Cabeçalho com tabela
      {
        table: {
          widths: [100, '*'],
          body: [
            [
              {
                image: logoBase64,
                width: 80,
                alignment: 'center',
                margin: [10, 10, 10, 10],
                border: [true, true, false, true]
              },
              {
                stack: [
                  { text: 'CENTRO DA JUVENTUDE', fontSize: 12, bold: true, alignment: 'center' },
                  { text: 'Avenida Governador Matto', fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0] },
                  { text: 'Laranjeiras do Sul - PR', fontSize: 9, alignment: 'center' },
                  { text: 'Avenida Dr. Lamartine Pinto Avelar nº 1589, Bairro Cidade de Deus', fontSize: 8, alignment: 'center', margin: [0, 4, 0, 0] },
                  { text: 'CEP: 85.305-000', fontSize: 8, alignment: 'center' },
                  { text: 'Telefone: (42) 3619-4706 - Ramal 8192', fontSize: 8, alignment: 'center' },
                  { text: 'WhatsApp: (42) 3672-3891 RE', fontSize: 8, alignment: 'center' }
                ],
                fillColor: '#FFD700',
                margin: [10, 5, 10, 5],
                border: [false, true, true, true]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: true,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5
        },
        margin: [0, 0, 0, 15]
      },
      
      // Título
      { text: 'Formulário de Renovação de Matrícula', fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 15] },
      
      // Dados da Criança/Adolescente
      {
        table: {
          widths: ['*', 100],
          body: [
            [
              { text: `Nome da criança/adolescente: ${matricula.nomeCompleto}`, fontSize: 9, margin: [3, 3, 3, 3], colSpan: 2 },
              {}
            ],
            [
              { text: `CPF: ${matricula.cpf}`, fontSize: 9, margin: [3, 3, 3, 3] },
              { text: `Idade: ${calcularIdadeCompleta(matricula.dataNascimento)}`, fontSize: 9, margin: [3, 3, 3, 3] }
            ],
            [
              { text: `NIS: ${matricula.cadUnicoAluno || ''}`, fontSize: 9, margin: [3, 3, 3, 3], colSpan: 2 },
              {}
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },
      
      // Dados do Responsável
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Nome do responsável: ${matricula.nomeResponsavel}`, fontSize: 9, margin: [3, 3, 3, 3], colSpan: 2 },
              {}
            ],
            [
              { text: `CPF: ${matricula.cpf}`, fontSize: 9, margin: [3, 3, 3, 3] },
              { text: `NIS: ${matricula.cadUnicoResponsavel || ''}`, fontSize: 9, margin: [3, 3, 3, 3] }
            ],
            [
              { text: `Endereço: ${matricula.endereco}, ${matricula.numeroEndereco}${matricula.complemento ? ' - ' + matricula.complemento : ''} - ${matricula.bairro}`, fontSize: 9, margin: [3, 3, 3, 3], colSpan: 2 },
              {}
            ],
            [
              { text: `Telefone: ${matricula.telefone}`, fontSize: 9, margin: [3, 3, 3, 3], colSpan: 2 },
              {}
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },
      
      // Escola
      {
        table: {
          widths: ['*', 80, 80],
          body: [
            [
              { text: `Escola: ${matricula.escola || ''}`, fontSize: 9, margin: [3, 3, 3, 3] },
              { text: `Série: ${matricula.serie || ''}`, fontSize: 9, margin: [3, 3, 3, 3] },
              { text: `Turno: ${matricula.turno || ''}`, fontSize: 9, margin: [3, 3, 3, 3] }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },
      
      // Turno SCFV
      {
        text: [
          { text: 'Turno SCFV/CEJU:  ', fontSize: 9 },
          { text: `Manhã ( ${matricula.turnoSCFV === 'manha' ? 'X' : ' '} )    `, fontSize: 9 },
          { text: `Tarde ( ${matricula.turnoSCFV === 'tarde' ? 'X' : ' '} )`, fontSize: 9 }
        ],
        margin: [0, 5, 0, 10]
      },
      
      // Transporte
      {
        text: [
          { text: 'Utiliza transporte:  ', fontSize: 9 },
          { text: `Não ( ${!matricula.utilizaTransporte ? 'X' : ' '} )    `, fontSize: 9 },
          { text: `Sim ( ${matricula.utilizaTransporte ? 'X' : ' '} )    `, fontSize: 9 },
          { text: `Embarque: ${matricula.localEmbarque || '___________'}    `, fontSize: 9 },
          { text: `Desembarque: ${matricula.localDesembarque || '___________'}`, fontSize: 9 }
        ],
        margin: [0, 0, 0, 10]
      },
      
      // Almoço
      {
        text: [
          { text: 'Almoço:  ', fontSize: 9 },
          { text: `Sim ( ${matricula.almoco ? 'X' : ' '} )    `, fontSize: 9 },
          { text: `Não ( ${!matricula.almoco ? 'X' : ' '} )`, fontSize: 9 }
        ],
        margin: [0, 0, 0, 10]
      },
      
      // Demanda espontânea
      {
        text: [
          { text: 'Demanda espontânea: ( )    Sim ( )    ', fontSize: 9 },
          { text: `Não, encaminhado por: ${matricula.encaminhadoPor || '___________'}`, fontSize: 9 }
        ],
        margin: [0, 0, 0, 10]
      },
      
      // Observações
      {
        table: {
          widths: ['*'],
          body: [
            [{ text: `Observações:\n${matricula.observacoes || ''}`, fontSize: 9, margin: [3, 3, 3, 20] }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },
      
      // Data
      {
        text: `Laranjeiras do Sul, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.`,
        fontSize: 10,
        margin: [0, 0, 0, 40]
      },
      
      // Assinaturas
      {
        columns: [
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Responsável', alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] }
            ]
          },
          { width: 20, text: '' },
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
              { text: 'Técnico Responsável', alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] }
            ]
          }
        ]
      }
    ]
  };

  pdfMake.createPdf(docDefinition).download(`Renovacao_${matricula.nomeCompleto}.pdf`);
};

// 3. Gerar PDF da Ficha de Natação
export const gerarFichaNatacaoPDF = async (matricula: Matricula) => {
  // Carregar a logo
  const logoBase64 = await carregarImagemBase64('/Logo - centro da juventude.jpeg');
  
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      // Cabeçalho com tabela (incluindo espaço para foto)
      {
        table: {
          widths: [100, '*', 80],
          body: [
            [
              {
                image: logoBase64,
                width: 80,
                alignment: 'center',
                margin: [10, 10, 10, 10],
                border: [true, true, false, true]
              },
              {
                stack: [
                  { text: 'CENTRO DA JUVENTUDE', fontSize: 12, bold: true, alignment: 'center' },
                  { text: 'Avenida Dr. Lamartine Pinto Avelar nº 1589', fontSize: 8, alignment: 'center', margin: [0, 3, 0, 0] },
                  { text: 'Bairro Cidade de Deus', fontSize: 8, alignment: 'center' },
                  { text: 'CEP: 85.305-000', fontSize: 8, alignment: 'center' },
                  { text: 'Telefone: (42) 3619-4706 - Ramal 8192', fontSize: 8, alignment: 'center' },
                  { text: 'WhatsApp: (42) 3672-3891 RE', fontSize: 8, alignment: 'center' }
                ],
                fillColor: '#FFD700',
                margin: [10, 5, 10, 5],
                border: [false, true, false, true]
              },
              {
                text: '[FOTO\n3x4]',
                fontSize: 10,
                alignment: 'center',
                margin: [5, 15, 5, 15],
                border: [false, true, true, true]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: true,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5
        },
        margin: [0, 0, 0, 20]
      },
      
      // Título
      { text: 'FICHA DE INSCRIÇÃO OFICINA DE NATAÇÃO', fontSize: 13, bold: true, alignment: 'center', margin: [0, 5, 0, 12] },
      
      // Dados básicos
      { text: `DATA: ${formatarData(new Date())}`, fontSize: 9, margin: [0, 0, 0, 4] },
      { text: `NOME: ${matricula.nomeCompleto}`, fontSize: 9, margin: [0, 0, 0, 4] },
      {
        text: `DATA DE NASCIMENTO: ${formatarData(matricula.dataNascimento)}    IDADE: ${calcularIdadeCompleta(matricula.dataNascimento)}`,
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      { text: `PAI: ${matricula.nomePai || ''}`, fontSize: 9, margin: [0, 0, 0, 4] },
      { text: `MÃE: ${matricula.nomeMae || ''}`, fontSize: 9, margin: [0, 0, 0, 4] },
      {
        text: `ENDEREÇO: ${matricula.endereco}, ${matricula.numeroEndereco} - ${matricula.bairro}, ${matricula.municipio}/${matricula.uf}`,
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: `TELEFONE - CELULAR: ${matricula.telefone || ''}         E-mail: _________________________`,
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: `CASO DE URGÊNCIA CHAMAR: ${matricula.nomeResponsavel || ''}         TEL.: ${matricula.telefoneOutro || ''}`,
        fontSize: 9,
        margin: [0, 0, 0, 6]
      },
      
      // Informações escolares
      {
        text: `FREQUENTA ESCOLA?   SIM ( )  NÃO ( )         SÉRIE: ${matricula.serie || ''}`,
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      { text: `Colégio: ${matricula.escola || ''}`, fontSize: 9, margin: [0, 0, 0, 4] },
      { text: 'Turno:  Manhã ( )  Tarde ( )  Noite ( )', fontSize: 9, margin: [0, 0, 0, 8] },
      
      // Seção de saúde
      { text: 'ATENÇÃO:', fontSize: 11, bold: true, margin: [0, 8, 0, 6] },
      {
        text: 'Tem problema de Saúde:   SIM ( )  NÃO ( )      se for SIM, descrever abaixo OBS:',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }
        ],
        margin: [0, 8, 0, 0]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }
        ],
        margin: [0, 12, 0, 8]
      },
      
      // Informações médicas
      {
        text: 'Tipo Sanguíneo: ___________     Altura: ___________     Peso: ___________',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: 'Alergia a Medicamentos:  Sim ( )  Não ( )     Qual: _______________________________',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: 'Alergia a outras coisas:  Sim ( )  Não ( )     Qual: _______________________________',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: 'Medicação habitual:  Sim ( )  Não ( )     Qual: __________________________________',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: 'Já fez Natação Anteriormente:  Sim ( )  Não ( )     Tempo: __________________________',
        fontSize: 9,
        margin: [0, 0, 0, 4]
      },
      {
        text: 'Sabe Nadar:  Sim ( )  Não ( )     Nível Atual: _____________________________________',
        fontSize: 9,
        margin: [0, 0, 0, 12]
      },
      
      // Data e assinatura
      {
        text: `Laranjeiras do Sul, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.`,
        fontSize: 9,
        margin: [0, 8, 0, 35]
      },
      
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 250,
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Responsável', alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] }
            ]
          },
          { width: '*', text: '' }
        ]
      }
    ]
  };

  pdfMake.createPdf(docDefinition).download(`FichaNatacao_${matricula.nomeCompleto}.pdf`);
};

// 4. Gerar PDF de Solicitação de Desistência
export const gerarDesistenciaPDF = async (matricula: Matricula) => {
  // Carregar a logo
  const logoBase64 = await carregarImagemBase64('/Logo - centro da juventude.jpeg');
  
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    content: [
      // Cabeçalho com tabela
      {
        table: {
          widths: [100, '*'],
          body: [
            [
              {
                image: logoBase64,
                width: 80,
                alignment: 'center',
                margin: [10, 10, 10, 10],
                border: [true, true, false, true]
              },
              {
                stack: [
                  { text: 'CENTRO DA JUVENTUDE', fontSize: 12, bold: true, alignment: 'center' },
                  { text: 'Avenida Governador Matto', fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0] },
                  { text: 'Laranjeiras do Sul - PR', fontSize: 9, alignment: 'center' },
                  { text: 'Avenida Dr. Lamartine Pinto Avelar nº 1589, Bairro Cidade de Deus', fontSize: 8, alignment: 'center', margin: [0, 4, 0, 0] },
                  { text: 'CEP: 85.305-000', fontSize: 8, alignment: 'center' },
                  { text: 'Telefone: (42) 3619-4706 - Ramal 8192', fontSize: 8, alignment: 'center' },
                  { text: 'WhatsApp: (42) 3672-3891 RE', fontSize: 8, alignment: 'center' }
                ],
                fillColor: '#FFD700',
                margin: [10, 5, 10, 5],
                border: [false, true, true, true]
              }
            ]
          ]
        },
        layout: {
          defaultBorder: true,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5
        },
        margin: [0, 0, 0, 20]
      },
      
      // Título
      { text: 'Solicitação de Desistência de Matrícula', fontSize: 14, bold: true, alignment: 'center', margin: [0, 10, 0, 25] },
      
      // Corpo do formulário
      {
        text: [
          { text: 'Eu ', fontSize: 11 },
          { text: matricula.nomeResponsavel, fontSize: 11, bold: true, decoration: 'underline' },
          { text: ' RG/CPF ', fontSize: 11 },
          { text: matricula.cpf, fontSize: 11, bold: true, decoration: 'underline' }
        ],
        margin: [0, 0, 0, 8]
      },
      
      {
        text: [
          { text: 'responsável pela criança/adolescente ', fontSize: 11 },
          { text: matricula.nomeCompleto, fontSize: 11, bold: true, decoration: 'underline' }
        ],
        margin: [0, 0, 0, 8]
      },
      
      {
        text: [
          { text: 'RG/CPF nº ', fontSize: 11 },
          { text: matricula.rg || '_________________', fontSize: 11, bold: true, decoration: 'underline' }
        ],
        margin: [0, 0, 0, 15]
      },
      
      // Texto de solicitação
      {
        text: 'solicito a desistência da matrícula do mesmo(a) no Serviço de Convivência e',
        fontSize: 11,
        margin: [0, 0, 0, 5]
      },
      
      {
        text: [
          { text: 'Fortalecimento de Vínculos, pelos motivos: ', fontSize: 11 },
          { text: '__________________________________', fontSize: 11, decoration: 'underline' }
        ],
        margin: [0, 0, 0, 8]
      },
      
      // Linhas para preenchimento de motivos
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }
        ],
        margin: [0, 10, 0, 0]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }
        ],
        margin: [0, 15, 0, 20]
      },
      
      // Texto informativo
      {
        text: 'Fico ciente que, uma vez que desista da vaga, a mesma será direcionada para outra criança/adolescente que atenda aos critérios de inclusão do SCFV, sendo que foi esclarecido(a) que a qualquer tempo posso estar solicitando a nova reavaliação para inserção no serviço mediante disponibilidade de vaga.',
        fontSize: 10,
        alignment: 'justify',
        lineHeight: 1.4,
        margin: [0, 0, 0, 30]
      },
      
      // Data
      {
        text: [
          { text: 'Laranjeiras do Sul, ', fontSize: 10 },
          { text: `${new Date().getDate()}`, fontSize: 10, decoration: 'underline' },
          { text: ' de ', fontSize: 10 },
          { text: `${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`, fontSize: 10, decoration: 'underline' },
          { text: ' de 20', fontSize: 10 },
          { text: `${new Date().getFullYear().toString().substring(2)}`, fontSize: 10, decoration: 'underline' }
        ],
        margin: [0, 0, 0, 50]
      },
      
      // Assinaturas
      {
        columns: [
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Responsável legal', alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] }
            ]
          },
          { width: 20, text: '' },
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }] },
              { text: 'Assinatura do Responsável pelo Atendimento', alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] }
            ]
          }
        ]
      }
    ]
  };

  pdfMake.createPdf(docDefinition).download(`Desistencia_${matricula.nomeCompleto}.pdf`);
};
