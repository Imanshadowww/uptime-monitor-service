const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const extract = require('extract-zip');

const PORT = process.env.PORT || 3000;
const UUID = 'd342d11e-d424-4583-b36e-524ab1f0afa4';

const settings = {
  "inbounds": [{
    "port": parseInt(PORT),
    "listen": "0.0.0.0",
    "protocol": "vless",
    "settings": {
      "clients": [{"id": UUID}],
      "decryption": "none"
    },
    "streamSettings": {
      "network": "ws",
      "wsSettings": {"path": "/live-sync"}
    }
  }],
  "outbounds": [{"protocol": "freedom"}]
};

fs.writeFileSync('sys_env.json', JSON.stringify(settings));

async function startEngine() {
  try {
    if (!fs.existsSync('app-engine')) {
      console.log("[INFO]: Fetching core components...");
      const response = await axios({
        url: 'https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip',
        method: 'GET',
        responseType: 'stream'
      });
      const writer = fs.createWriteStream('core.zip');
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log("[INFO]: Extracting modules...");
      await extract('core.zip', { dir: process.cwd() });
      fs.renameSync('xray', 'app-engine');
      fs.chmodSync('app-engine', '755');
      fs.unlinkSync('core.zip'); 
    }

    console.log("[INFO]: Starting application engine on port " + PORT);
    const engine = spawn('./app-engine', ['-c', 'sys_env.json']);

    engine.stdout.on('data', data => console.log(`[SYS]: ${data}`));
    engine.stderr.on('data', data => console.error(`[ERR]: ${data}`));

  } catch (error) {
    console.error("[FATAL]: Initialization failed!", error.message);
  }
}

startEngine();
