import esbuild from "esbuild";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

console.log("🚀 Iniciando build da aplicação...");

// Carregar configuração da aplicação
const appConfig = JSON.parse(readFileSync("./app.config.json", "utf8"));

// Criar diretório de saída se não existir
if (!existsSync("dist")) {
  mkdirSync("dist", { recursive: true });
}

try {
  // Build com esbuild
  await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    outdir: "dist",
    format: "cjs",
    external: ["@aws-sdk/*", "aws-sdk"],
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV !== "production",
    keepNames: true,
    metafile: true,
  });

  // Criar manifest para infraestrutura
  const manifest = {
    ...appConfig,
    build: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    },
    artifacts: {
      main: "main.js",
      size: "calculated-by-infra",
    },
  };

  writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));

  console.log("✅ Build concluído com sucesso!");
  console.log(`📦 Artefatos gerados em: dist/`);
  console.log(`📋 Manifest criado: dist/manifest.json`);
} catch (error) {
  console.error("❌ Erro durante o build:", error);
  process.exit(1);
}
