const { execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

async function build() {
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit' });
}

function serveDist(port = 5000) {
  const distPath = path.resolve(__dirname, '../../dist');
  if (!fs.existsSync(distPath)) throw new Error('dist folder not found; run build first');

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(distPath, decodeURIComponent(reqPath));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      // Basic content-type mapping
      const ext = path.extname(filePath);
      const map = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.wasm': 'application/wasm',
      };
      if (map[ext]) res.setHeader('Content-Type', map[ext]);
      res.end(data);
    });
  });

  return new Promise(resolve => {
    server.listen(port, () => {
      console.log(`Serving dist on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function runTest() {
  await build();
  const server = await serveDist(5000);

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });

    // Wait for test API to be available
    await page.waitForFunction(() => !!window.__TEST_API__);

    console.log('Test API available — moving block into goal');

    // Move the block directly to the goal position and trigger condition check
    await page.evaluate(() => {
      const api = window.__TEST_API__;
      const block = api.physicsObjects.block;
      const goalMesh = api.physicsObjects.goal.mesh;
      // Place block at goal position
      if (block?.body && goalMesh) {
        // Rapier bodies expose setTranslation in WASM binding
        if (typeof block.body.setTranslation === 'function') {
          block.body.setTranslation(
            { x: goalMesh.position.x, y: goalMesh.position.y + 0.2, z: goalMesh.position.z },
            true
          );
        } else if (typeof block.body.setTranslationRaw === 'function') {
          block.body.setTranslationRaw(
            goalMesh.position.x,
            goalMesh.position.y + 0.2,
            goalMesh.position.z,
            true
          );
        }
      }

      // Call checkGameConditions to let game detect win
      api.checkGameConditions({
        gameOver: false,
        physicsObjects: api.physicsObjects,
        showMessage: api.showMessage,
      });
    });

    // Wait for message element to show "You Win!"
    await page.waitForFunction(
      () => {
        const els = document.querySelectorAll('div');
        for (const el of els) {
          if (el.textContent && el.textContent.includes('You Win')) return true;
        }
        return false;
      },
      { timeout: 5000 }
    );

    const message = await page.evaluate(() => {
      const els = document.querySelectorAll('div');
      for (const el of els) {
        if (el.textContent && el.textContent.includes('You Win')) return el.textContent;
      }
      return '';
    });
    console.log('Game message:', message);
    if (!message.includes('You Win')) throw new Error('Expected win message not found');

    console.log('Integration test passed — game reached expected win state.');
  } finally {
    await browser.close();
    server.close();
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
