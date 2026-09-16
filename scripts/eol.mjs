import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, extname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, '..');

const IGNORED_DIRS = new Set([
  '.git',
  '.idea',
  '.pnpm-store',
  '.turbo',
  '.vscode',
  'coverage',
  'dist',
  'dist-docs',
  'dist-storybook',
  'Docs',
  'node_modules',
  'out',
  'storybook-static',
]);

const BINARY_EXTENSIONS = new Set([
  '.bin',
  '.class',
  '.dll',
  '.dylib',
  '.eot',
  '.exe',
  '.gif',
  '.gz',
  '.ico',
  '.iso',
  '.jar',
  '.jpeg',
  '.jpg',
  '.mp3',
  '.mp4',
  '.ogg',
  '.otf',
  '.pdf',
  '.png',
  '.rar',
  '.so',
  '.tar',
  '.tgz',
  '.ttf',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.7z',
  '.zip',
]);

/**
 * Check whether a buffer is likely a binary file by inspecting for null bytes.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function isBinaryBuffer(buffer) {
  const checkLen = Math.min(buffer.length, 8000);
  for (let i = 0; i < checkLen; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Recursively collect all text file paths in a directory.
 * @param {string} dir
 * @param {string[]} fileList
 * @returns {string[]}
 */
function collectFiles(dir, fileList = []) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        collectFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!BINARY_EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

/**
 * Main execution function.
 */
function run() {
  const args = process.argv.slice(2);
  let isFix = false;
  const targetFiles = [];

  for (const arg of args) {
    if (arg === '--fix' || arg === '-f') {
      isFix = true;
    } else if (arg === '--check' || arg === '-c') {
      isFix = false;
    } else if (!arg.startsWith('-')) {
      targetFiles.push(resolve(process.cwd(), arg));
    }
  }

  let filesToProcess = [];

  if (targetFiles.length > 0) {
    for (const filePath of targetFiles) {
      if (existsSync(filePath)) {
        const stat = statSync(filePath);
        if (stat.isFile()) {
          const ext = extname(filePath).toLowerCase();
          if (!BINARY_EXTENSIONS.has(ext)) {
            filesToProcess.push(filePath);
          }
        } else if (stat.isDirectory()) {
          collectFiles(filePath, filesToProcess);
        }
      }
    }
  } else {
    filesToProcess = collectFiles(ROOT_DIR);
  }

  const nonLfFiles = [];
  let fixedCount = 0;

  for (const filePath of filesToProcess) {
    try {
      const buffer = readFileSync(filePath);
      if (isBinaryBuffer(buffer)) {
        continue;
      }

      const content = buffer.toString('utf8');
      if (content.includes('\r')) {
        const relPath = relative(ROOT_DIR, filePath).replace(/\\/g, '/');
        nonLfFiles.push(relPath);

        if (isFix) {
          const normalized = content.replace(/\r\n|\r/g, '\n');
          writeFileSync(filePath, normalized, 'utf8');
          fixedCount++;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`⚠️  Warning: Unable to process ${filePath}: ${message}`);
    }
  }

  if (isFix) {
    if (fixedCount > 0) {
      console.log(`✅ Normalized line separators to LF for ${fixedCount} file(s):`);
      for (const file of nonLfFiles) {
        console.log(`   - ${file}`);
      }

      // Re-normalize Git index if inside a git repository so Git does not flag unchanged files as modified
      try {
        if (existsSync(join(ROOT_DIR, '.git'))) {
          execSync('git add --renormalize .', { cwd: ROOT_DIR, stdio: 'ignore' });
          execSync('git reset -q HEAD', { cwd: ROOT_DIR, stdio: 'ignore' });
        }
      } catch {
        // Ignore if git command fails or is unavailable in environment
      }
    } else {
      console.log('✅ All files already have consistent LF line separators.');
    }
    process.exit(0);
  }

  // Check mode
  if (nonLfFiles.length > 0) {
    console.error(
      `❌ Line separator check failed: Found ${nonLfFiles.length} file(s) with non-LF line endings:`,
    );
    for (const file of nonLfFiles) {
      console.error(`   - ${file}`);
    }
    console.error('\nRun "pnpm run eol:fix" or "pnpm run eol" to normalize line endings to LF.');
    process.exit(1);
  }

  console.log(
    `✅ All ${filesToProcess.length} checked file(s) have consistent LF line separators.`,
  );
  process.exit(0);
}

run();
