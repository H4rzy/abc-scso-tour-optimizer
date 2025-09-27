const { spawn } = require('child_process');

const ENGINE_EXE = process.env.ENGINE_EXE_PATH;

exports.runEngine = () => new Promise((resolve, reject) => {
  if (!ENGINE_EXE) {
    return reject(new Error('ENGINE_EXE_PATH chưa được khai báo trong .env'));
  }

  console.log(`[EngineConnector] Running engine: ${ENGINE_EXE}`);

  const proc = spawn(`"${ENGINE_EXE}"`, [], { shell: true });

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', d => {
    stdout += d.toString();
    console.log('[Engine STDOUT]', d.toString());
  });

  proc.stderr.on('data', d => {
    stderr += d.toString();
    console.error('[Engine STDERR]', d.toString());
  });

  proc.on('error', err => reject(new Error(`Không thể khởi chạy Engine: ${err.message}`)));

  proc.on('close', code => {
    if (code !== 0) {
      return reject(new Error(`Engine kết thúc với mã ${code}: ${stderr}`));
    }
    resolve(stdout.trim());
  });
});