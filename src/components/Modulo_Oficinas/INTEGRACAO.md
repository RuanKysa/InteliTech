# Guia de Integração - Módulo de Oficinas

## ✅ Implementação Completa

O módulo de oficinas foi totalmente integrado com o backend Spring Boot.

## 🔧 Configuração

### 1. Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (copie de `.env.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Iniciar o Backend

Certifique-se de que o backend Spring Boot está rodando:

```bash
cd backend
mvn spring-boot:run
```

O backend estará disponível em `http://localhost:8080`

### 3. Verificar Endpoints

Acesse a documentação Swagger:
```
http://localhost:8080/swagger-ui.html
```

## 📡 Endpoints Implementados

### Oficinas
- ✅ `POST /api/oficinas` - Criar oficina
- ✅ `GET /api/oficinas` - Listar (com filtros)
- ✅ `GET /api/oficinas/{id}` - Buscar por ID
- ✅ `PUT /api/oficinas/{id}` - Atualizar
- ✅ `DELETE /api/oficinas/{id}` - Excluir
- ✅ `GET /api/oficinas/resumo` - Estatísticas

### Responsáveis
- ✅ `POST /api/oficinas/responsaveis` - Criar
- ✅ `GET /api/oficinas/responsaveis` - Listar
- ✅ `GET /api/oficinas/responsaveis/{id}` - Buscar
- ✅ `PUT /api/oficinas/responsaveis/{id}` - Atualizar
- ✅ `DELETE /api/oficinas/responsaveis/{id}` - Excluir

### Agentes Cidadania
- ✅ `POST /api/oficinas/agentes-cidadania` - Criar
- ✅ `GET /api/oficinas/agentes-cidadania` - Listar
- ✅ `GET /api/oficinas/agentes-cidadania/{id}` - Buscar
- ✅ `PUT /api/oficinas/agentes-cidadania/{id}` - Atualizar
- ✅ `DELETE /api/oficinas/agentes-cidadania/{id}` - Excluir

### Distribuição de Alunos
- ✅ `POST /api/oficinas/distribuicao` - Inscrever aluno
- ✅ `GET /api/oficinas/distribuicao` - Listar todas
- ✅ `GET /api/oficinas/distribuicao/aluno/{id}` - Por aluno
- ✅ `GET /api/oficinas/distribuicao/oficina/{id}` - Por oficina
- ✅ `PUT /api/oficinas/distribuicao/{id}` - Atualizar
- ✅ `DELETE /api/oficinas/distribuicao/{id}` - Cancelar

## 🔄 Sistema de Fallback

O frontend implementa fallback automático para `localStorage` caso a API esteja indisponível:

```typescript
// Se a API falhar, dados são salvos/lidos do localStorage
oficinas -> localStorage.getItem('oficinas')
responsaveis -> localStorage.getItem('responsaveis')
agentesCidadania -> localStorage.getItem('agentesCidadania')
```

## 🧪 Testando a Integração

### 1. Com Backend Rodando

```bash
# Frontend
npm run dev

# Acesse: http://localhost:3000/oficinas
```

O sistema vai:
- ✅ Conectar ao backend Spring Boot
- ✅ Buscar dados reais do banco
- ✅ Salvar alterações no banco

### 2. Sem Backend (Modo Offline)

```bash
# Apenas frontend
npm run dev
```

O sistema vai:
- ✅ Usar dados do localStorage
- ✅ Simular operações CRUD localmente
- ⚠️ Dados não persistem no banco

## 📊 Fluxo de Dados

```
Frontend (Next.js)
    ↓
oficinaService.ts
    ↓
fetch(API_URL) → Spring Boot Backend
    ↓
PostgreSQL Database
    ↓
← Resposta JSON
    ↓
← Componentes React
```

## 🐛 Troubleshooting

### Erro de CORS

Se encontrar erro de CORS, verifique a configuração no backend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("*");
            }
        };
    }
}
```

### API não conecta

1. Verifique se o backend está rodando:
   ```bash
   curl http://localhost:8080/api/oficinas
   ```

2. Verifique o arquivo `.env.local`:
   ```bash
   cat .env.local
   ```

3. Verifique o console do navegador (F12) para erros

### Dados não aparecem

1. Verifique se há dados no banco:
   ```sql
   SELECT * FROM oficina;
   SELECT * FROM responsavel;
   SELECT * FROM agentes_cidadania;
   ```

2. Teste a API diretamente:
   ```bash
   curl http://localhost:8080/api/oficinas
   ```

## 🚀 Deploy em Produção

### Frontend (Vercel/Netlify)

Configure a variável de ambiente:
```bash
NEXT_PUBLIC_API_URL=https://sua-api.com
```

### Backend (Heroku/AWS/Azure)

Configure:
- URL do banco de dados
- CORS para permitir domínio do frontend
- Variáveis de ambiente sensíveis

## 📝 Notas Importantes

1. **IDs UUID**: Backend usa UUID, não números sequenciais
2. **Datas**: Formato ISO 8601 (`2026-03-16T10:30:00`)
3. **Enums**: Valores em UPPERCASE no backend
4. **Validação**: Backend valida dados com Bean Validation
5. **Transações**: Operações são transacionais no backend

## 🎯 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar paginação nas listagens
- [ ] Implementar upload de imagens
- [ ] Criar relatórios em PDF
- [ ] Adicionar notificações push
- [ ] Implementar sistema de backup

## 📚 Documentação Relacionada

- [README do Módulo](./README.md)
- [Documentação Backend](../../../backend/docs/OFICINAS.md)
- [Swagger UI](http://localhost:8080/swagger-ui.html)
