#!/usr/bin/env python3
import json
import yaml
import argparse
import subprocess
import sys
from pathlib import Path

def load_manifest(artifact_path):
    """Carregar manifest da aplicação"""
    manifest_path = Path(artifact_path) / 'dist' / 'manifest.json'
    with open(manifest_path, 'r') as f:
        return json.load(f)

def load_environment_config(environment):
    """Carregar configuração do ambiente"""
    env_path = Path(f'environments/{environment}.yaml')
    with open(env_path, 'r') as f:
        return yaml.safe_load(f)

def prepare_sam_parameters(manifest, env_config, environment):
    """Preparar parâmetros para SAM"""
    return {
        'AppName': manifest['application']['name'],
        'AppVersion': manifest['application']['version'],
        'Environment': environment,
        'RuntimeVersion': manifest['application']['runtime'],
        'HandlerFunction': manifest['resources']['handler'],
        'MemorySize': env_config['resources']['lambda']['memorySize'],
        'TimeoutSeconds': env_config['resources']['lambda']['timeoutSeconds']
    }

def validate_manifest(manifest):
    """Validar manifest da aplicação"""
    required_fields = [
        'application.name',
        'application.version',
        'application.runtime',
        'resources.handler'
    ]

    for field in required_fields:
        keys = field.split('.')
        value = manifest
        for key in keys:
            if key not in value:
                raise ValueError(f"Campo obrigatório ausente: {field}")
            value = value[key]

    print("✅ Manifest validado com sucesso")

def run_sam_build():
    """Executar SAM build"""
    print("🔨 Executando SAM build...")
    result = subprocess.run(['sam', 'build', '--template', 'template.yaml'],
                          capture_output=True, text=True)

    if result.returncode != 0:
        print(f"❌ Erro no SAM build: {result.stderr}")
        sys.exit(1)

    print("✅ SAM build concluído")

def run_sam_deploy(parameters, environment, confirm=True):
    """Executar SAM deploy"""
    print(f"🚀 Executando deploy para {environment}...")

    # Preparar parâmetros como string
    param_overrides = []
    for key, value in parameters.items():
        param_overrides.append(f"{key}={value}")

    cmd = [
        'sam', 'deploy',
        '--config-env', environment,
        '--parameter-overrides', ' '.join(param_overrides)
    ]

    if not confirm:
        cmd.append('--no-confirm-changeset')

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"❌ Erro no deploy: {result.stderr}")
        sys.exit(1)

    print("✅ Deploy concluído com sucesso")
    return result.stdout

def main():
    parser = argparse.ArgumentParser(description='Deploy da aplicação')
    parser.add_argument('--artifact-path', required=True,
                       help='Caminho para os artefatos da aplicação')
    parser.add_argument('--environment', required=True,
                       choices=['dev', 'staging', 'prod'],
                       help='Ambiente de deploy')
    parser.add_argument('--no-confirm', action='store_true',
                       help='Deploy sem confirmação')

    args = parser.parse_args()

    try:
        # Carregar configurações
        manifest = load_manifest(args.artifact_path)
        env_config = load_environment_config(args.environment)

        # Validar manifest
        validate_manifest(manifest)

        # Preparar parâmetros
        parameters = prepare_sam_parameters(manifest, env_config, args.environment)

        print(f"📋 Configurações do deploy:")
        print(f"   App: {parameters['AppName']} v{parameters['AppVersion']}")
        print(f"   Ambiente: {args.environment}")
        print(f"   Runtime: {parameters['RuntimeVersion']}")
        print(f"   Memória: {parameters['MemorySize']} MB")

        # Executar build e deploy
        run_sam_build()
        output = run_sam_deploy(parameters, args.environment, not args.no_confirm)

        print("\n🎉 Deploy realizado com sucesso!")
        print("📊 Outputs:")
        print(output)

    except Exception as e:
        print(f"❌ Erro durante o deploy: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
