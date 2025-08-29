# 🔧 Configuração do GitHub Actions

Este documento descreve como configurar os secrets e permissões necessárias para as pipelines de CI/CD funcionarem corretamente.

## 📋 Secrets Necessários

### Repositório da Aplicação (nest-roles-app)

| Secret                  | Descrição                                                  | Exemplo                                    |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Access Key ID da AWS para deploy                           | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key da AWS                                   | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `INFRA_REPO_TOKEN`      | Personal Access Token para acionar deploy no repo de infra | `ghp_xxxxxxxxxxxxxxxxxxxx`                 |

### Repositório da Infraestrutura (nest-roles-infra)

| Secret                  | Descrição                        | Exemplo                                    |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Access Key ID da AWS para deploy | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key da AWS         | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

## 🔐 Configuração dos Secrets

### 1. Secrets da AWS

#### Criar usuário IAM para pipelines

```bash
# Criar usuário para CI/CD
aws iam create-user --user-name github-actions-nest-roles

# Criar access key
aws iam create-access-key --user-name github-actions-nest-roles
```

#### Policy para o usuário da aplicação (nest-roles-app)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::company-artifacts/nest-roles-app/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::company-artifacts"]
    }
  ]
}
```

#### Policy para o usuário da infraestrutura (nest-roles-infra)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

**⚠️ Importante:** Para produção, refine as permissões seguindo o princípio do menor privilégio.

### 2. Personal Access Token (PAT)

1. Vá para **GitHub Settings** > **Developer settings** > **Personal access tokens**
2. Clique em **Generate new token (classic)**
3. Configure as seguintes permissões:
   - `repo` (acesso total aos repositórios)
   - `workflow` (acionar workflows)
4. Copie o token gerado

### 3. Configurar Secrets nos Repositórios

#### No repositório nest-roles-app:

```bash
# Via GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "AKIAIOSFODNN7EXAMPLE"
gh secret set AWS_SECRET_ACCESS_KEY --body "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
gh secret set INFRA_REPO_TOKEN --body "ghp_xxxxxxxxxxxxxxxxxxxx"
```

#### No repositório nest-roles-infra:

```bash
# Via GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "AKIAIOSFODNN7EXAMPLE"
gh secret set AWS_SECRET_ACCESS_KEY --body "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

## 🎯 Configuração do S3

### Criar bucket para artefatos

```bash
# Criar bucket
aws s3 mb s3://company-artifacts --region sa-east-1

# Configurar versionamento
aws s3api put-bucket-versioning \
  --bucket company-artifacts \
  --versioning-configuration Status=Enabled

# Configurar lifecycle (opcional)
cat > lifecycle.json << 'EOF'
{
    "Rules": [
        {
            "ID": "DeleteOldArtifacts",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "nest-roles-app/"
            },
            "Expiration": {
                "Days": 30
            },
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 7
            }
        }
    ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket company-artifacts \
  --lifecycle-configuration file://lifecycle.json
```

## 🔄 Fluxo das Pipelines

### Pipeline da Aplicação (nest-roles-app)

```mermaid
graph LR
    A[Push to main] --> B[Tests & Lint]
    B --> C[Build App]
    C --> D[Create Artifact]
    D --> E[Upload to S3]
    E --> F[Trigger Infra Deploy]
    F --> G[Create Release]
```

### Pipeline da Infraestrutura (nest-roles-infra)

```mermaid
graph LR
    A[Repository Dispatch] --> B[Download Artifact]
    B --> C[Validate Artifact]
    C --> D[SAM Deploy]
    D --> E[Smoke Tests]
    E --> F[Notify Success]
```

## ✅ Validação da Configuração

### Testar pipeline da aplicação

```bash
# Clone do repositório
git clone https://github.com/your-org/nest-roles-app.git
cd nest-roles-app

# Fazer uma mudança e push
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger pipeline"
git push origin main
```

### Testar deploy manual

1. Vá para o repositório `nest-roles-infra` no GitHub
2. Actions > Manual Deploy > Run workflow
3. Escolha o ambiente e artefato
4. Execute o workflow

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. "Access Denied" no S3

```bash
# Verificar permissões
aws s3 ls s3://company-artifacts/
aws iam get-user-policy --user-name github-actions-nest-roles --policy-name S3Access
```

#### 2. "Repository not found" no dispatch

- Verificar se o token tem permissão `repo`
- Confirmar o nome correto do repositório de infraestrutura

#### 3. "Stack does not exist" no SAM deploy

- Verificar se o nome da stack está correto
- Executar deploy inicial manualmente

### Logs Úteis

```bash
# Ver execuções do workflow
gh run list

# Ver logs de uma execução específica
gh run view RUN_ID --log

# Ver status dos secrets
gh secret list
```

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Repository Dispatch Events](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)

---

**🔒 Lembre-se:** Sempre siga as melhores práticas de segurança e revise regularmente as permissões e secrets configurados.
