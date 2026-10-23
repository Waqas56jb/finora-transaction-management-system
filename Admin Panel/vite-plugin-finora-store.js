import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMethod, createInitialState } from './src/services/storeCore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Local demo store for Vite dev and preview.
 * Reads and writes a JSON file shared by the three panels.
 * It never calls the endpoint URLs stored in server profiles.
 */
export function finoraStorePlugin() {
  const file = path.resolve(__dirname, '../.finora/demo-store.json');

  function readState() {
    if (!fs.existsSync(file)) {
      const state = createInitialState();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      try {
        fs.writeFileSync(file, JSON.stringify(state, null, 2), { flag: 'wx' });
        return state;
      } catch (error) {
        if (error.code === 'EEXIST') return JSON.parse(fs.readFileSync(file, 'utf8'));
        throw error;
      }
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  function writeState(state) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(state, null, 2));
    fs.renameSync(temp, file);
  }

  const handle = (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url !== '/__finora/rpc') return next();
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: { message: 'Use POST for the demo store.' } }));
      return;
    }

    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        res.statusCode = 413;
        res.end();
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        const state = readState();
        const result = applyMethod(state, body.method, body.payload);
        if (result.mutate) writeState(result.state);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, data: result.data }));
      } catch (error) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (error?.expose) {
          res.end(JSON.stringify({
            ok: false,
            error: { code: error.code, message: error.message, fields: error.fields || null },
          }));
          return;
        }
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: { message: 'The local demo store could not complete that operation.' } }));
      }
    });
  };

  const attach = (server) => {
    server.middlewares.use(handle);
  };

  return {
    name: 'finora-demo-store',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
