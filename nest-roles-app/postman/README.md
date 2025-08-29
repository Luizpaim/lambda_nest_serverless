# Nest Roles API - Documentação Postman (Arquitetura SOLID)

## 📋 Visão Geral

Esta collection do Postman documenta a API de Roles refatorada com **princípios SOLID**, mantendo a arquitetura modular do NestJS.

## 🏗️ Arquitetura SOLID Aplicada

### **SRP (Single Responsibility Principle)**

- **Controller**: Responsável apenas por receber requisições HTTP
- **Service**: Responsável apenas pela lógica de negócio
- **Repository**: Responsável apenas pelo acesso aos dados
- **Entity**: Responsável apenas por representar o domínio Role
- **Factory**: Responsável apenas por criar clientes DynamoDB

### **OCP (Open/Closed Principle)**

- Sistema extensível através de interfaces
- Novas implementações podem ser adicionadas sem modificar código existente

### **LSP (Liskov Substitution Principle)**

- Implementações concretas podem ser substituídas pelas interfaces
- `RolesService` implementa `IRoleService`
- `RolesRepository` implementa `IRoleRepository`

### **ISP (Interface Segregation Principle)**

- Interfaces específicas e focadas:
    - `IRoleService`: Operações de negócio
    - `IRoleRepository`: Operações de dados
    - `IDatabaseClient`: Operações de banco

### **DIP (Dependency Inversion Principle)**

- Controller depende da abstração `IRoleService`
- Service depende da abstração `IRoleRepository`
- Repository depende da abstração `IDatabaseClientFactory`

## 📁 Arquivos da Collection

### Collections

- **`Nest_Roles_API_SOLID.postman_collection.json`**: Collection principal com arquitetura SOLID
- ~~`Nest_Roles_API_Complete.postman_collection.json`~~: Collection antiga (deprecated)

### Environments

- **`AWS_Production_Environment.postman_environment.json`**: Ambiente AWS (conta-stitcloud)
- **`Local_Environment.postman_environment.json`**: Ambiente local para desenvolvimento

## 🚀 Como Usar

### 1. Importar no Postman

```bash
# Importar a collection
Nest_Roles_API_SOLID.postman_collection.json

# Importar os environments
AWS_Production_Environment.postman_environment.json
Local_Environment.postman_environment.json
```

### 2. Configurar Environment

- **Local**: `http://localhost:3000`
- **AWS**: `https://fbw7p7383f.execute-api.sa-east-1.amazonaws.com/dev`

### 3. Testar Endpoints

#### Health Check

```http
GET {{baseUrl}}/roles/health
```

#### CRUD Completo

```http
# Listar todos os roles
GET {{baseUrl}}/roles

# Listar apenas roles ativos
GET {{baseUrl}}/roles/active

# Buscar role por ID
GET {{baseUrl}}/roles/{{roleId}}

# Criar novo role
POST {{baseUrl}}/roles
{
    "name": "Developer",
    "description": "Developer role with code access",
    "permissions": ["read", "write", "code"],
    "isActive": true
}

# Atualizar role
PATCH {{baseUrl}}/roles/{{roleId}}
{
    "description": "Updated description",
    "permissions": ["read", "write", "code", "review"]
}

# Ativar role
PATCH {{baseUrl}}/roles/{{roleId}}/activate

# Desativar role
PATCH {{baseUrl}}/roles/{{roleId}}/deactivate

# Excluir role
DELETE {{baseUrl}}/roles/{{roleId}}
```

## 📊 Estrutura de Dados

### Role Entity

```json
{
    "id": "uuid",
    "name": "string (único)",
    "description": "string",
    "permissions": ["array", "of", "strings"],
    "isActive": "boolean",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
}
```

### Response Patterns

#### Lista de Roles

```json
{
    "items": [Role],
    "count": "number",
    "timestamp": "ISO 8601",
    "lastEvaluatedKey": "optional pagination key"
}
```

#### Role Individual

```json
{
    "id": "uuid",
    "name": "string",
    "description": "string",
    "permissions": ["array"],
    "isActive": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

#### Error Response

```json
{
    "message": "Error description"
}
```

## ✅ Testes Automáticos

A collection inclui testes automáticos que validam:

- ✅ Status codes corretos (200, 201, 204)
- ✅ Content-Type JSON
- ✅ Tempo de resposta razoável
- ✅ Estrutura de dados correta
- ✅ Propriedades obrigatórias presentes

## 🔧 Variáveis Disponíveis

### Environment Variables

- `baseUrl`: URL base da API
- `environment`: Ambiente atual (local/aws)
- `region`: Região AWS
- `stage`: Stage do API Gateway

### Collection Variables

- `roleId`: ID de exemplo para testes

## 📈 Melhorias da Arquitetura SOLID

### Antes (Código Monolítico)

- Controller com lógica de negócio e acesso direto ao DynamoDB
- Código duplicado entre métodos
- Difícil de testar e manter
- Acoplamento forte com AWS SDK

### Depois (Arquitetura SOLID)

- Controller limpo e focado apenas em HTTP
- Service com lógica de negócio centralizada
- Repository abstrai acesso aos dados
- Factory gerencia criação de clientes
- Interfaces permitem extensibilidade
- Fácil de testar com mocks
- Baixo acoplamento

## 🚀 Deploy Information

- **AWS Account**: conta-stitcloud
- **Region**: sa-east-1
- **API Gateway**: https://fbw7p7383f.execute-api.sa-east-1.amazonaws.com/dev
- **Lambda Function**: aws-nest-roles-api-dev-v2-NestRolesApiFunction
- **DynamoDB Table**: dev-roles

## 📝 Changelog

### v2.0 (2025-08-29) - Arquitetura SOLID

- ✅ Aplicados todos os princípios SOLID
- ✅ Refatoração completa mantendo arquitetura NestJS
- ✅ Interfaces para abstrações
- ✅ Injeção de dependências via tokens
- ✅ Entidade Role com métodos de domínio
- ✅ Factory pattern para DynamoDB client
- ✅ Testes automáticos atualizados
- ✅ Documentação completa da arquitetura

### v1.0 (2025-08-29) - Versão Inicial

- ✅ CRUD básico funcionando
- ✅ Endpoints de debug
- ✅ Collection inicial do Postman

---

**Desenvolvido com NestJS + AWS Lambda + DynamoDB + Princípios SOLID** 🚀
