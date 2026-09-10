const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const extract = require('extract-zip');
const http = require('http');
const net = require('net');

// پورت استاندارد کلود ران
const PORT = process.env.PORT || 8080;
const INTERNAL_PORT = 10000;
const SECURE_TOKEN = 'd342d11e-d424-4583-b36e-524ab1f0afa4'; 

const profilePath = './sys-config.json';
const archivePath = './sys-core.zip';
const binPath = './sys-worker';

const sysProfile = {
  "inbounds": [{
    "port": INTERNAL_PORT,
    "listen": "127.0.0.1",
    "protocol": "vless",
    "settings": {
      "clients": [{"id": SECURE_TOKEN}],
      "decryption": "none"
    },
    "streamSettings": {
      "network": "ws",
      "wsSettings": {"path": "/live-sync"}
    }
  }],
  "outbounds": [{"protocol": "freedom"}]
};

async function bootSequence() {
  try {
    fs.writeFileSync(profilePath, JSON.stringify(sysProfile));

    if (!fs.existsSync(binPath)) {
      console.log("[SYSTEM] Downloading core dependencies...");
      const response = await axios({
        url: 'https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip',
        method: 'GET',
        responseType: 'stream'
      });
      const writer = fs.createWriteStream(archivePath);
      response.data.pipe(writer);
      await new Promise((resolve) => writer.on('finish', resolve));
      
      console.log("[SYSTEM] Unpacking core...");
      await extract(archivePath, { dir: process.cwd() });
      fs.renameSync('xray', binPath);
      fs.chmodSync(binPath, '755');
      fs.unlinkSync(archivePath);
    }

    console.log("[SUCCESS] Core engine starting...");
    const worker = spawn(binPath, ['-c', profilePath]);

    // سرور جعلی برای تست سلامت گوگل کلود
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Monitor Service is Online and Active.');
    });

    // هدایت ترافیک فیلترشکن
    server.on('upgrade', (req, socket, head) => {
        if (req.url === '/live-sync') {
            const proxy = net.createConnection(INTERNAL_PORT, '127.0.0.1', () => {
                let headers = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
                for (let i = 0; i < req.rawHeaders.length; i += 2) {
                    headers += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
                }
                headers += '\r\n';
                proxy.write(headers);
                proxy.write(head);
                socket.pipe(proxy).pipe(socket);
            });
            proxy.on('error', () => socket.end());
            socket.on('error', () => proxy.end());
        } else {
            socket.end();
        }
    });

    // اتصال به تمام آی‌پی‌ها برای سازگاری با کلود ران
    server.listen(PORT, '0.0.0.0', () => {
         console.log(`[SUCCESS] Monitor Gateway listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("[FATAL]:", error.message);
  }
}

bootSequence();
