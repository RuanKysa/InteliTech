import React, { useState, useRef, useEffect } from 'react';
import { Matricula, DocumentoAnexo } from '../types';
import UploadDocumentos from './UploadDocumentos';
import styles from '../styles/Matricula.module.css';

interface FormularioMatriculaProps {
  matriculaInicial?: Matricula;
  onSalvar: (matricula: Matricula) => void;
  onCancelar: () => void;
}

export default function FormularioMatricula({ matriculaInicial, onSalvar, onCancelar }: FormularioMatriculaProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [idadeFormatada, setIdadeFormatada] = useState<string>('');
  
  const [formData, setFormData] = useState<Matricula>(matriculaInicial || {
    nomeCompleto: '',
    dataNascimento: '',
    idade: 0,
    turnoSCFV: '',
    naturalidade: '',
    municipio: '',
    uf: '',
    pais: 'Brasil',
    rg: '',
    rgUF: '',
    dataExpedicao: '',
    cpf: '',
    cadUnicoAluno: '',
    cadUnicoResponsavel: '',
    etnia: 'nao_informar',
    programaSocial: 'nao_possui',
    quantasPessoasResidencia: 0,
    nomeMae: '',
    rgMae: '',
    ufMae: '',
    nomePai: '',
    rgPai: '',
    ufPai: '',
    nomeResponsavel: '',
    parentesco: '',
    endereco: '',
    numeroEndereco: '',
    complemento: '',
    bairro: '',
    postoDeSaude: '',
    telefone: '',
    telefoneOutro: '',
    escola: '',
    serie: '',
    turno: '',
    possuiDeficiencia: false,
    tipoDeficiencia: 'nao_possui',
    usaRemediosControlados: false,
    observacaoRemedios: '',
    observacoes: '',
    utilizaTransporte: false,
    localEmbarque: '',
    localDesembarque: '',
    almoco: false,
    encaminhadoPor: '',
    dataEncaminhamento: '',
    documentos: [],
    status: 'pendente',
    dataCadastro: new Date(),
    matriculaAssinada: false,
  });

  // Calcular idade automaticamente
  useEffect(() => {
    if (formData.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(formData.dataNascimento);
      
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
      
      const textoIdade = partes.length > 0 ? partes.join(', ') : '0 dias';
      setIdadeFormatada(textoIdade);
      setFormData(prev => ({ ...prev, idade: anos }));
    } else {
      setIdadeFormatada('');
    }
  }, [formData.dataNascimento]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentosChange = (documentos: DocumentoAnexo[]) => {
    setFormData(prev => ({ ...prev, documentos }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matriculaParaSalvar = {
      ...formData,
      dataAtualizacao: new Date(),
    };
    onSalvar(matriculaParaSalvar);
  };

  const handleImprimir = () => {
    window.print();
  };

  const estados = [
    { value: 'AC', label: 'AC' },
    { value: 'AL', label: 'AL' },
    { value: 'AP', label: 'AP' },
    { value: 'AM', label: 'AM' },
    { value: 'BA', label: 'BA' },
    { value: 'CE', label: 'CE' },
    { value: 'DF', label: 'DF' },
    { value: 'ES', label: 'ES' },
    { value: 'GO', label: 'GO' },
    { value: 'MA', label: 'MA' },
    { value: 'MT', label: 'MT' },
    { value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' },
    { value: 'PA', label: 'PA' },
    { value: 'PB', label: 'PB' },
    { value: 'PR', label: 'PR' },
    { value: 'PE', label: 'PE' },
    { value: 'PI', label: 'PI' },
    { value: 'RJ', label: 'RJ' },
    { value: 'RN', label: 'RN' },
    { value: 'RS', label: 'RS' },
    { value: 'RO', label: 'RO' },
    { value: 'RR', label: 'RR' },
    { value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' },
    { value: 'SE', label: 'SE' },
    { value: 'TO', label: 'TO' },
  ];

  const SelectEstado = ({ name, value }: { name: string; value: string }) => (
    <select name={name} value={value} onChange={handleInputChange} className={styles.select}>
      <option value="">Selecione</option>
      {estados.map(estado => (
        <option key={estado.value} value={estado.value}>{estado.label}</option>
      ))}
    </select>
  );

  return (
    <div className={styles.container} ref={formRef}>
      <div className={styles.header}>
        <h1>Ficha de Matrícula</h1>
        <p>Preencha todos os campos obrigatórios marcados com *</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* DADOS PESSOAIS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Nome Completo <span className={styles.required}>*</span></label>
              <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleInputChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Data de Nascimento <span className={styles.required}>*</span></label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Idade</label>
              <input type="text" name="idade" value={idadeFormatada} className={styles.input} readOnly style={{ backgroundColor: '#f8fafc' }} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Turno SCFV</label>
              <select name="turnoSCFV" value={formData.turnoSCFV} onChange={handleInputChange} className={styles.select}>
                <option value="">Selecione</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="integral">Integral</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Naturalidade</label>
              <input type="text" name="naturalidade" value={formData.naturalidade} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Município</label>
              <input type="text" name="municipio" value={formData.municipio} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>UF</label>
              <SelectEstado name="uf" value={formData.uf} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>País</label>
              <input type="text" name="pais" value={formData.pais} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Documentos</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>RG <span className={styles.required}>*</span></label>
              <input type="text" name="rg" value={formData.rg} onChange={handleInputChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>UF (RG)</label>
              <SelectEstado name="rgUF" value={formData.rgUF} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Data Expedição</label>
              <input type="date" name="dataExpedicao" value={formData.dataExpedicao} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CPF <span className={styles.required}>*</span></label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} className={styles.input} placeholder="000.000.000-00" required />
            </div>
          </div>
        </div>

        {/* CAD ÚNICO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>CAD ÚNICO (NIS)</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>CAD ÚNICO (NIS) - Aluno</label>
              <input type="text" name="cadUnicoAluno" value={formData.cadUnicoAluno} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CAD ÚNICO (NIS) - Responsável</label>
              <input type="text" name="cadUnicoResponsavel" value={formData.cadUnicoResponsavel} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>
        </div>

        {/* ETNIA/RAÇA */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Etnia/Raça</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Selecione a etnia/raça</label>
              <select name="etnia" value={formData.etnia} onChange={handleInputChange} className={styles.select}>
                <option value="branca">Branca</option>
                <option value="negra">Negra</option>
                <option value="parda">Parda</option>
                <option value="amarela">Amarela</option>
                <option value="indigena">Indígena</option>
                <option value="nao_informar">Não desejo informar</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROGRAMAS SOCIAIS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Programas Sociais</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Integrante de Programas Sociais</label>
              <select name="programaSocial" value={formData.programaSocial} onChange={handleInputChange} className={styles.select}>
                <option value="nao_possui">Não possui</option>
                <option value="bolsa_familia">Bolsa Família</option>
                <option value="bpc">BPC</option>
                <option value="tarifa_social">Tarifa Social</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quantas pessoas moram na residência?</label>
              <input type="number" name="quantasPessoasResidencia" value={formData.quantasPessoasResidencia} onChange={handleInputChange} className={styles.input} min="0" />
            </div>
          </div>
        </div>

        {/* FILIAÇÃO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Filiação</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Nome da Mãe</label>
              <input type="text" name="nomeMae" value={formData.nomeMae} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>RG (Mãe)</label>
              <input type="text" name="rgMae" value={formData.rgMae} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>UF (Mãe)</label>
              <SelectEstado name="ufMae" value={formData.ufMae} />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Nome do Pai</label>
              <input type="text" name="nomePai" value={formData.nomePai} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>RG (Pai)</label>
              <input type="text" name="rgPai" value={formData.rgPai} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>UF (Pai)</label>
              <SelectEstado name="ufPai" value={formData.ufPai} />
            </div>
          </div>
        </div>

        {/* RESPONSÁVEL */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Responsável</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome do Responsável</label>
              <input type="text" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Parentesco</label>
              <input type="text" name="parentesco" value={formData.parentesco} onChange={handleInputChange} className={styles.input} placeholder="Ex: Pai, Mãe, Avó" />
            </div>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Endereço</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Endereço <span className={styles.required}>*</span></label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} className={styles.input} placeholder="Rua, Avenida, etc" required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nº <span className={styles.required}>*</span></label>
              <input type="text" name="numeroEndereco" value={formData.numeroEndereco} onChange={handleInputChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Complemento</label>
              <input type="text" name="complemento" value={formData.complemento} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bairro <span className={styles.required}>*</span></label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Posto de Saúde</label>
              <input type="text" name="postoDeSaude" value={formData.postoDeSaude} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>
        </div>

        {/* CONTATO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contato</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Telefone <span className={styles.required}>*</span></label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} className={styles.input} placeholder="(00) 00000-0000" required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Telefone (outro)</label>
              <input type="tel" name="telefoneOutro" value={formData.telefoneOutro} onChange={handleInputChange} className={styles.input} placeholder="(00) 00000-0000" />
            </div>
          </div>
        </div>

        {/* ESCOLA */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações Escolares</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Escola</label>
              <input type="text" name="escola" value={formData.escola} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Série</label>
              <input type="text" name="serie" value={formData.serie} onChange={handleInputChange} className={styles.input} placeholder="Ex: 5º ano" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Turno</label>
              <select name="turno" value={formData.turno} onChange={handleInputChange} className={styles.select}>
                <option value="">Selecione</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          </div>
        </div>

        {/* PESSOA COM DEFICIÊNCIA */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pessoa com Deficiência (PCD)</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div className={styles.checkbox}>
                <input type="checkbox" name="possuiDeficiencia" checked={formData.possuiDeficiencia} onChange={handleInputChange} id="possuiDeficiencia" />
                <label htmlFor="possuiDeficiencia" style={{ cursor: 'pointer' }}>Possui alguma deficiência</label>
              </div>
            </div>

            {formData.possuiDeficiencia && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Deficiência</label>
                <select name="tipoDeficiencia" value={formData.tipoDeficiencia} onChange={handleInputChange} className={styles.select}>
                  <option value="fisica">Física</option>
                  <option value="auditiva">Auditiva</option>
                  <option value="visual">Visual</option>
                  <option value="mental">Mental</option>
                  <option value="intelectual">Intelectual</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* REMÉDIOS CONTROLADOS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações de Saúde</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div className={styles.checkbox}>
                <input type="checkbox" name="usaRemediosControlados" checked={formData.usaRemediosControlados} onChange={handleInputChange} id="usaRemediosControlados" />
                <label htmlFor="usaRemediosControlados" style={{ cursor: 'pointer' }}>Usa remédios controlados</label>
              </div>
            </div>

            {formData.usaRemediosControlados && (
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Especifique o(s) remédio(s) e dosagem</label>
                <textarea 
                  name="observacaoRemedios" 
                  value={formData.observacaoRemedios || ''} 
                  onChange={handleInputChange} 
                  className={styles.textarea} 
                  placeholder="Ex: Ritalina 10mg - 1 vez ao dia pela manhã"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* TRANSPORTE E ALIMENTAÇÃO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Transporte e Alimentação</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div className={styles.checkbox}>
                <input type="checkbox" name="utilizaTransporte" checked={formData.utilizaTransporte} onChange={handleInputChange} id="utilizaTransporte" />
                <label htmlFor="utilizaTransporte" style={{ cursor: 'pointer' }}>Utiliza Transporte</label>
              </div>
            </div>

            {formData.utilizaTransporte && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Local de Embarque</label>
                  <input type="text" name="localEmbarque" value={formData.localEmbarque} onChange={handleInputChange} className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Local de Desembarque</label>
                  <input type="text" name="localDesembarque" value={formData.localDesembarque} onChange={handleInputChange} className={styles.input} />
                </div>
              </>
            )}

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div className={styles.checkbox}>
                <input type="checkbox" name="almoco" checked={formData.almoco} onChange={handleInputChange} id="almoco" />
                <label htmlFor="almoco" style={{ cursor: 'pointer' }}>Almoço</label>
              </div>
            </div>
          </div>
        </div>

        {/* ENCAMINHAMENTO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Encaminhamento</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Encaminhado por</label>
              <input type="text" name="encaminhadoPor" value={formData.encaminhadoPor} onChange={handleInputChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Data</label>
              <input type="date" name="dataEncaminhamento" value={formData.dataEncaminhamento} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Documentos Anexados</h2>
          <UploadDocumentos documentos={formData.documentos} onDocumentosChange={handleDocumentosChange} />
        </div>

        {/* OBSERVAÇÕES */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Observações</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Observações</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} className={styles.textarea} placeholder="Informações adicionais relevantes" />
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className={styles.actions}>
          <button type="button" onClick={onCancelar} className={`${styles.button} ${styles.buttonSecondary}`}>
            Cancelar
          </button>
          <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
            Salvar Matrícula
          </button>
        </div>
      </form>
    </div>
  );
}
