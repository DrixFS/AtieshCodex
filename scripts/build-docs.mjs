import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT_DIR, 'Docs');

console.log('========================================================');
console.log('🏗️  Building Atiesh Codex Monorepo Docs...');
console.log('========================================================\n');

// 1. Prepare Docs directory
if (existsSync(DOCS_DIR)) {
  rmSync(DOCS_DIR, { recursive: true, force: true });
}
mkdirSync(DOCS_DIR, { recursive: true });
mkdirSync(join(DOCS_DIR, 'api'), { recursive: true });

// 2. Generate Server OpenAPI Spec & Contracts
console.log('📦 [1/3] Generating Server OpenAPI Specification & Contracts...');
try {
  execSync('pnpm --filter server run generate:api-types', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Failed to generate server OpenAPI specs:', message);
  process.exit(1);
}

// 3. Generate Client API Documentation via TypeDoc
console.log('\n📦 [2/3] Generating Client API Documentation (TypeDoc)...');
try {
  execSync('pnpm --filter client run docs', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Failed to generate client API documentation:', message);
  process.exit(1);
}

// 4. Generate Web Components Storybook Static Documentation
console.log('\n📦 [3/3] Building Web Components Storybook Documentation...');
try {
  execSync('pnpm --filter @atiesh/components run build:storybook', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Failed to build Storybook documentation:', message);
  process.exit(1);
}

// 5. Generate Documentation Portal Hub (index.html)
console.log('\n📄 Generating Documentation Portal Landing Hub...');
const portalHtml = `<!DOCTYPE html>
<!--suppress HtmlUnknownTarget -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atiesh Codex - Developer Documentation</title>
  <style>
    :root {
      --bg-primary: #0b0e14;
      --bg-card: #151b26;
      --bg-card-hover: #1e2638;
      --border: #2a3449;
      --text-primary: #e6edf3;
      --text-muted: #8b949e;
      --accent-gold: #f5af00;
      --accent-gold-glow: rgba(245, 175, 0, 0.25);
      --accent-blue: #388bfd;
      --accent-green: #2ea043;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family), sans-serif;
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      border-bottom: 1px solid var(--border);
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: linear-gradient(180deg, #121824 0%, var(--bg-primary) 100%);
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      background-color: var(--accent-gold-glow);
      color: var(--accent-gold);
      border: 1px solid var(--accent-gold);
      margin-bottom: 0.75rem;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    h1 span {
      color: var(--accent-gold);
    }

    p.subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      max-width: 650px;
      margin: 0 auto;
    }

    main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      width: 100%;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      color: inherit;
    }

    .card:hover {
      background-color: var(--bg-card-hover);
      border-color: var(--accent-gold);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -10px var(--accent-gold-glow);
    }

    .card-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .card h2 {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      flex: 1;
      margin-bottom: 1.5rem;
    }

    .card-footer {
      display: flex;
      align-items: center;
      color: var(--accent-gold);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .card-footer svg {
      margin-left: 0.35rem;
      transition: transform 0.2s ease;
    }

    .card:hover .card-footer svg {
      transform: translateX(4px);
    }

    .info-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
    }

    .info-section h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--accent-gold);
    }

    .info-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .info-item {
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .info-item strong {
      display: block;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .info-item span {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-family: monospace;
    }

    footer {
      border-top: 1px solid var(--border);
      padding: 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="badge">Monorepo Documentation</div>
    <h1>Atiesh <span>Codex</span></h1>
    <p class="subtitle">Complete technical reference, UI component library, and structured REST API documentation for developers and agents.</p>
  </header>

  <main>
    <div class="grid">
      <a class="card" href="./client/index.html">
        <div class="card-icon">⚡</div>
        <h2>Client API Reference</h2>
        <p>Comprehensive TypeDoc and TSDoc reference for the React 19 SPA, MobX stores, ApiClient, query cache, and core architecture.</p>
        <div class="card-footer">
          Open Client Docs
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </a>

      <a class="card" href="./storybook/index.html">
        <div class="card-icon">🎨</div>
        <h2>Storybook Design System</h2>
        <p>Interactive Lit 3 Web Component explorer with live prop controls, design tokens, responsive states, and theme variants.</p>
        <div class="card-footer">
          Launch Storybook
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </a>

      <a class="card" href="./api/index.html">
        <div class="card-icon">📜</div>
        <h2>Server REST API Reference</h2>
        <p>Structured REST API documentation detailing all endpoints, DTO models, data schemas, request/response contracts, and parameters.</p>
        <div class="card-footer">
          Open Server API Docs
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </a>
    </div>

    <div class="info-section">
      <h3>🚀 Quick Developer Reference</h3>
      <ul class="info-list">
        <li class="info-item">
          <strong>Structured Server API Reference</strong>
          <span>Docs/api/index.html (Port 4000)</span>
        </li>
        <li class="info-item">
          <strong>Storybook Hot-Reload</strong>
          <span>pnpm run dev:storybook (Port 6006)</span>
        </li>
        <li class="info-item">
          <strong>Build All Docs (Static)</strong>
          <span>pnpm run build:docs</span>
        </li>
        <li class="info-item">
          <strong>Preview Docs Locally</strong>
          <span>pnpm run preview:docs (Port 4000)</span>
        </li>
      </ul>
    </div>
  </main>

  <footer>
    Atiesh Codex &bull; Monorepo Documentation Hub
  </footer>
</body>
</html>
`;

writeFileSync(join(DOCS_DIR, 'index.html'), portalHtml, 'utf-8');

console.log('\n✅ Documentation build complete! Output available at: Docs/');
console.log('💡 Run "pnpm run preview:docs" to preview the documentation locally.\n');
