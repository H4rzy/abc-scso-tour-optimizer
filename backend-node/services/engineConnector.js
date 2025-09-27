const { spawn } = require('child_process');
const path = require('path');

// path tới file exe C# đã build (đổi cho đúng)
const ENGINE_EXE = process.env.ENGINE_EXE_PATH || 'C:\\path\\to\\EngineCSharp.exe';

exports.optimize = (inputJson) => new Promise((resolve, reject) => {
  const proc = spawn(ENGINE_EXE, [], { stdio: ['pipe', 'pipe', 'pipe'] });

  let stdout = '', stderr = '';
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());

  proc.on('close', code => {
    if (code !== 0) return reject(new Error(stderr || `Engine exited ${code}`));
    try {
      const result = JSON.parse(stdout); // Engine in ra JSON
      resolve(result);
    } catch (e) {
      reject(new Error('Engine output is not valid JSON'));
    }
  });

  proc.stdin.write(JSON.stringify(inputJson));
  proc.stdin.end();
});
