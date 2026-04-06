# Módulo de Oficinas

Sistema completo para gerenciamento de oficinas, responsáveis, agentes cidadania e distribuição de alunos por horários.

## 🚀 Configuração

### Backend API

1. Configure a URL da API no arquivo `.env.local` (copie de `.env.example`):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

2. Certifique-se de que o backend Spring Boot esteja rodando na porta 8080

### Fallback Local

Se a API não estiver disponível, o sistema automaticamente usa `localStorage` como fallback.

## 📋 Funcionalidades

### 1. Gerenciar Oficinas
- ✅ Criar novas oficinas
- ✅ Editar oficinas existentes
- ✅ Excluir oficinas
- ✅ Definir categoria (esporte, arte, música, dança, artesanato, informática, idiomas, outras)
- ✅ Atribuir responsável (professor/estagiário)
- ✅ Configurar múltiplos horários com vagas
- ✅ Definir faixa etária
- ✅ Adicionar materiais necessários
- ✅ Controlar status (planejada, ativa, suspensa, encerrada)

### 2. Distribuir Alunos
- ✅ Visualizar oficinas ativas
- ✅ Selecionar horários disponíveis
- ✅ Adicionar alunos matriculados aos horários
- ✅ Controle de vagas disponíveis
- ✅ Filtrar alunos por nome e idade
- ✅ Remover alunos de horários
- ✅ Visualizar alunos já matriculados

### 3. Gerenciar Pessoas
#### Responsáveis
- ✅ Cadastrar professores e estagiários
- ✅ Editar informações de responsáveis
- ✅ Excluir responsáveis
- ✅ Armazenar dados de contato e especialidade

#### Agentes Cidadania
- ✅ Cadastrar agentes cidadania
- ✅ Editar informações dos agentes
- ✅ Excluir agentes
- ✅ Controlar status (ativo/inativo)
- ✅ Armazenar dados pessoais e de contato

## 🗂️ Estrutura de Arquivos

```
Modulo_Oficinas/
├── types/
│   └── index.ts                    # Interfaces e tipos TypeScript
├── services/
│   └── oficinaService.ts           # Serviços de API
├── components/
│   ├── GerenciarOficinas.tsx       # CRUD de oficinas
│   ├── DistribuirAlunos.tsx        # Distribuição de alunos
│   └── GerenciarPessoas.tsx        # Gestão de responsáveis e agentes
├── styles/
│   ├── ModuloOficinas.module.css   # Estilos do dashboard
│   ├── GerenciarOficinas.module.css
│   ├── DistribuirAlunos.module.css
│   └── GerenciarPessoas.module.css
└── index.tsx                       # Componente principal
```

## 🔗 Integração com Backend

### Endpoints da API

Base URL: `http://localhost:8080/api/oficinas`

#### Oficinas
```
POST   /api/oficinas              - Criar nova oficina
GET    /api/oficinas              - Listar todas (filtros: categoria, status, responsavel, diaSemana, dataInicio, dataFim, pesquisa)
GET    /api/oficinas/{id}         - Buscar oficina por ID
PUT    /api/oficinas/{id}         - Atualizar oficina
DELETE /api/oficinas/{id}         - Excluir oficina
GET    /api/oficinas/resumo       - Obter resumo estatístico
```

#### Responsáveis
```
POST   /api/oficinas/responsaveis          - Criar responsável
GET    /api/oficinas/responsaveis          - Listar todos
GET    /api/oficinas/responsaveis/{id}     - Buscar por ID
PUT    /api/oficinas/responsaveis/{id}     - Atualizar responsável
DELETE /api/oficinas/responsaveis/{id}     - Excluir responsável
```

#### Agentes Cidadania
```
POST   /api/oficinas/agentes-cidadania     - Criar agente
GET    /api/oficinas/agentes-cidadania     - Listar todos
GET    /api/oficinas/agentes-cidadania/{id} - Buscar por ID
PUT    /api/oficinas/agentes-cidadania/{id} - Atualizar agente
DELETE /api/oficinas/agentes-cidadania/{id} - Excluir agente
```

#### Distribuição de Alunos
```
POST   /api/oficinas/distribuicao                  - Inscrever aluno
GET    /api/oficinas/distribuicao                  - Listar todas distribuições
GET    /api/oficinas/distribuicao/aluno/{alunoId}  - Oficinas de um aluno
GET    /api/oficinas/distribuicao/oficina/{id}     - Alunos de uma oficina
PUT    /api/oficinas/distribuicao/{id}             - Atualizar distribuição
DELETE /api/oficinas/distribuicao/{id}             - Cancelar inscrição
```

### Exemplos de Requisição

#### Criar Oficina
```json
POST /api/oficinas
{
  "nome": "Futsal Infantil",
  "descricao": "Oficina de futsal para crianças",
  "categoria": "esporte",
  "responsavelId": "uuid-do-responsavel",
  "horarios": [
    {
      "diaSemana": "segunda",
      "horaInicio": "14:00",
      "horaFim": "16:00",
      "vagas": 20
    }
  ],
  "idadeMinima": 6,
  "idadeMaxima": 12,
  "vagasTotais": 40,
  "dataInicio": "2026-04-01",
  "dataFim": "2026-12-20",
  "local": "Quadra Poliesportiva",
  "sala": "Quadra 1",
  "materiais": ["Bola", "Coletes"],
  "status": "ativa"
}
```

#### Distribuir Aluno
```json
POST /api/oficinas/distribuicao
{
  "alunoId": "uuid-do-aluno",
  "oficinaId": "uuid-da-oficina",
  "horarioId": "uuid-do-horario",
  "status": "confirmado",
  "observacoes": "Aluno com experiência"
}
```

## 📊 Tipos de Dados

### Oficina
- ID, nome, descrição, categoria
- Responsável (professor/estagiário)
- Horários (dia semana, hora início/fim, vagas)
- Vagas totais e disponíveis
- Faixa etária (mínima e máxima)
- Período (data início e fim)
- Local e sala
- Materiais necessários
- Status (planejada/ativa/suspensa/encerrada)

### Responsável
- ID, nome, tipo (professor/estagiário)
- Email, telefone
- Especialidade
- Data de admissão

### Agente Cidadania
- ID, nome
- Data de nascimento, CPF
- Email, telefone, endereço
- Data de início
- Status (ativo/inativo)

### Horário
- ID, dia da semana
- Hora início e fim
- Vagas disponíveis
- Lista de alunos matriculados

## 🚀 Como Usar

### 1. Criar uma Oficina
1. Acesse "Gerenciar Oficinas"
2. Preencha os dados da oficina
3. Adicione horários disponíveis
4. Opcionalmente adicione materiais necessários
5. Clique em "Criar Oficina"

### 2. Distribuir Alunos
1. Acesse "Distribuir Alunos"
2. Selecione a oficina desejada
3. Escolha o horário
4. Selecione os alunos a adicionar
5. Clique em "Adicionar Alunos"

### 3. Cadastrar Responsáveis/Agentes
1. Acesse "Gerenciar Pessoas"
2. Escolha a aba desejada
3. Preencha o formulário
4. Clique em "Cadastrar"

## 💾 Fallback Local

O sistema utiliza localStorage como fallback caso o backend esteja indisponível:
- `oficinas` - Lista de oficinas
- `responsaveis` - Lista de responsáveis
- `agentesCidadania` - Lista de agentes cidadania

## 🎨 Temas e Cores

- Principal: `#667eea` (roxo/azul)
- Secundária: `#764ba2` (roxo)
- Sucesso: `#28a745` (verde)
- Erro: `#dc3545` (vermelho)
- Aviso: `#ffc107` (amarelo)

## 📱 Responsividade

Todos os componentes são totalmente responsivos e adaptam-se a:
- Desktop (>1200px)
- Tablet (768px - 1200px)
- Mobile (<768px)

## 🔐 Autenticação

O módulo está protegido pelo componente `ProtectedRoute` e requer autenticação.

## 📄 Página de Acesso

Para acessar o módulo:
```
/oficinas
```

## 🛠️ Melhorias Futuras

- [ ] Relatórios de frequência
- [ ] Exportação de dados em PDF/Excel
- [ ] Sistema de chamada integrado
- [ ] Notificações para responsáveis
- [ ] Calendário visual de horários
- [ ] Gestão de materiais e estoque
- [ ] Avaliações e feedback dos alunos
