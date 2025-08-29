# 🚀 Guia de Deploy - Arquitetura Separada

## 🎯 Visão Geral

Este projeto implementa uma arquitetura completamente separada entre **desenvolvimento** e **infraestrutura**, garantindo:

- ✅ **Separação clara de responsabilidades**
- ✅ **Deploy automático via GitHub Actions**
- ✅ **Segurança com princípio do menor privilégio**
- ✅ **Rastreabilidade completa de deployments**

## 📋 Estrutura dos Repositórios

### 🏗️ nest-roles-app (Aplicação)

```
nest-roles-app/
├── src/                    # Código da aplicação
├── app.config.json         # Configuração da aplicação
├── build.mjs              # Script de build personalizado
├── package.json           # Dependências focadas em desenvolvimento
└── .github/workflows/     # Pipelines de CI
    ├── build.yml          # Pipeline principal (push → build → deploy)
    └── pr-validation.yml  # Validação de Pull Requests
```

### 🏗️ nest-roles-infra (Infraestrutura)

```
nest-roles-infra/
├── template.yaml          # Template SAM principal
├── environments/          # Configurações por ambiente
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
├── scripts/
│   └── deploy.py          # Script de deploy inteligente
└── .github/workflows/     # Pipelines de CD
    ├── deploy.yml         # Deploy automático
    └── manual-deploy.yml  # Deploy manual
```

## 🔄 Fluxo de Deploy Automático

### 1. Developer faz push para `main` no nest-roles-app

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### 2. Pipeline da aplicação é executada automaticamente

1. **Testes e Lint** - Valida qualidade do código
2. **Build** - Compila aplicação com esbuild
3. **Manifest** - Cria manifest.json com metadados
4. **Artifact** - Empacota e envia para S3
5. **Trigger** - Dispara deploy na infraestrutura

### 3. Pipeline da infraestrutura é executada automaticamente

1. **Download** - Baixa artefato do S3
2. **Validação** - Verifica integridade do artefato
3. **Deploy** - Executa SAM deploy com configurações do ambiente
4. **Smoke Tests** - Testa se a API está funcionando
5. **Notificação** - Informa sucesso/falha

## 🎛️ Deploy Manual

Para deployments fora do fluxo normal:

1. Vá para o repositório `nest-roles-infra` no GitHub
2. **Actions** → **Manual Deploy** → **Run workflow**
3. Selecione:
   - **Ambiente**: dev, staging, prod
   - **Artefato**: deixe vazio para usar o mais recente
   - **Pular testes**: apenas se necessário
4. Clique em **Run workflow**

## 🔧 Configuração Inicial

### 1. Criar S3 bucket para artefatos

```bash
aws s3 mb s3://company-artifacts --region sa-east-1
aws s3api put-bucket-versioning \
  --bucket company-artifacts \
  --versioning-configuration Status=Enabled
```

### 2. Configurar secrets no GitHub

#### nest-roles-app:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `INFRA_REPO_TOKEN` (Personal Access Token)

#### nest-roles-infra:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Veja detalhes completos em [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### 3. Configurar repositórios no GitHub

```bash
# Criar repositórios (exemplo)
gh repo create company/nest-roles-app --private
gh repo create company/nest-roles-infra --private

# Push do código
cd nest-roles-app
git remote add origin https://github.com/company/nest-roles-app.git
git push -u origin main

cd ../nest-roles-infra
git remote add origin https://github.com/company/nest-roles-infra.git
git push -u origin main
```

## 🎯 Ambientes e Configurações

### Development (dev)

- **Recursos**: 512MB RAM, 30s timeout
- **Banco**: Pay-per-request, sem backup
- **CORS**: Liberado para \*
- **Logs**: Debug level

### Staging (staging)

- **Recursos**: 768MB RAM, 30s timeout
- **Banco**: Pay-per-request, com backup
- **CORS**: Restrito ao domínio de staging
- **Logs**: Info level

### Production (prod)

- **Recursos**: 1GB RAM, 30s timeout, concorrência reservada
- **Banco**: Pay-per-request, backup + point-in-time recovery
- **CORS**: Restrito ao domínio de produção
- **Logs**: Info level
- **Monitoramento**: X-Ray tracing habilitado

## 📊 Monitoramento

### Status do Deploy

Cada deploy gera:

- **Release no GitHub** com informações do deployment
- **Summary detalhado** nos Actions
- **Logs estruturados** para auditoria

### Verificações Automáticas

- ✅ Validação de manifest
- ✅ Smoke tests da API
- ✅ Verificação de status HTTP
- ✅ Notificações em caso de falha

## 🔒 Segurança

### Separação de Acesso

- **Desenvolvedores**: Apenas código da aplicação, sem acesso a infraestrutura
- **DevOps/Infra**: Controle total da infraestrutura e deploys
- **Auditoria**: Todos os deployments são rastreáveis

### Validações de Segurança

- **Secrets scanning** nos PRs
- **Dependency audit** automático
- **IAM roles** com princípio do menor privilégio

## 🚨 Troubleshooting

### Deploy falhou?

1. **Check logs** nas GitHub Actions
2. **Verify artifacts** no S3
3. **Check AWS permissions** para o usuário de deploy
4. **Validate configuration** files

### Rollback necessário?

```bash
# Deploy manual com artefato anterior
# 1. Identifique o artefato anterior no S3
aws s3 ls s3://company-artifacts/nest-roles-app/ --recursive

# 2. Execute deploy manual com o artefato específico
# Via GitHub Actions: Manual Deploy → especificar artefato
```

### Emergency procedures

```bash
# Deploy direto via SAM (emergency only)
cd nest-roles-infra
python scripts/deploy.py \
  --artifact-path /path/to/artifacts \
  --environment dev \
  --no-confirm
```

## 📈 Próximos Passos

### Melhorias Futuras

- [ ] **Blue/Green deployments** para zero downtime
- [ ] **Automated rollback** em caso de falha
- [ ] **Integration tests** mais robustos
- [ ] **Multi-region** deployment
- [ ] **Canary releases** para produção

### Monitoramento Avançado

- [ ] **CloudWatch dashboards** customizados
- [ ] **Alertas proativos** via SNS
- [ ] **Performance monitoring** com X-Ray
- [ ] **Cost optimization** reports

---

## 📞 Suporte

- **Documentação**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Issues**: Use as GitHub Issues dos respectivos repositórios
- **Emergency**: Contate o time de DevOps

**🎉 Parabéns! Sua arquitetura separada está pronta para produção!**
