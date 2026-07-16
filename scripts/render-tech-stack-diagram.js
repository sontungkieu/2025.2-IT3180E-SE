const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const assetDir = path.join(rootDir, 'pdf', 'assets', 'techstack');
const isEnglish = process.argv.includes('--en');
const outputPath = path.join(
  assetDir,
  isEnglish ? 'tech_stack_architecture_en.png' : 'tech_stack_architecture.png',
);

const copy = isEnglish
  ? {
      heading: 'EcoBike deployment architecture from users to data',
      domainCaption: 'HTTPS demo endpoint via Cloudflare Tunnel',
      userDevices: 'Customers, staff, admins, and the GPS tab access the same EcoBike platform.',
      tunnel: 'Public HTTPS routing reaches the VM without exposing the app through an inbound firewall rule.',
      vm: 'The live demo VM keeps the app and tunnel running through systemd or Docker restart policies.',
      service: 'The container packages the static UI and HTTP API, bound internally to localhost:4173.',
      runtime: 'The browser runs the vanilla JavaScript UI, motion, 3D scene, and interactive map.',
      modules: 'Business modules handle authentication, requests, handover, return tickets, reports, and audit logs.',
      data: 'SQLite/WAL persists demo data; Cloud SQL is the scale-up path.',
    }
  : {
      heading: 'Kiến trúc triển khai EcoBike từ người dùng tới dữ liệu',
      domainCaption: 'HTTPS demo endpoint qua Cloudflare Tunnel',
      userDevices: 'Customer, Staff, Admin và tab GPS cùng truy cập nền tảng EcoBike.',
      tunnel: 'Public HTTPS route vào VM mà không cần mở inbound firewall cho app.',
      vm: 'VM thật chạy demo, giữ process app và tunnel bằng systemd/Docker restart.',
      service: 'Container đóng gói static UI và HTTP API, bind nội bộ localhost:4173.',
      runtime: 'Giao diện JavaScript thuần, motion, 3D scene và bản đồ chạy trong browser.',
      modules: 'Các module nghiệp vụ xử lý auth, request, handover, return ticket, report và audit.',
      data: 'SQLite/WAL lưu demo trên persistent path; Cloud SQL là hướng nâng cấp khi scale.',
    };

function logoDataUri(name) {
  const svg = fs.readFileSync(path.join(assetDir, `${name}.svg`), 'utf8');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const logos = {
  cloudflare: logoDataUri('cloudflare'),
  googlecloud: logoDataUri('googlecloud'),
  docker: logoDataUri('docker'),
  node: logoDataUri('nodedotjs'),
  js: logoDataUri('javascript'),
  gsap: logoDataUri('greensock'),
  three: logoDataUri('threedotjs'),
  leaflet: logoDataUri('leaflet'),
  sqlite: logoDataUri('sqlite'),
};

function logo(name, label) {
  return `<span class="logo-pill"><img src="${logos[name]}" alt="">${label}</span>`;
}

function chip(text) {
  return `<span class="chip">${text}</span>`;
}

function card({ step, title, subtitle, logosHtml = '', chips = [], tone = 'green' }) {
  return `
    <section class="layer ${tone}">
      <div class="step">${step}</div>
      <div class="copy">
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <div class="stack">${logosHtml}</div>
      <div class="chips">${chips.map(chip).join('')}</div>
    </section>
  `;
}

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1800px;
      height: 1000px;
      background: #f4faf7;
      color: #12201a;
      font-family: Arial, Helvetica, sans-serif;
      overflow: hidden;
    }
    .canvas {
      position: relative;
      width: 1800px;
      height: 1000px;
      padding: 42px 72px 44px;
      background:
        linear-gradient(90deg, rgba(15, 123, 85, 0.045) 1px, transparent 1px) 0 0 / 56px 56px,
        linear-gradient(rgba(8, 145, 178, 0.04) 1px, transparent 1px) 0 0 / 56px 56px,
        #f4faf7;
    }
    .header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 22px;
    }
    .eyebrow {
      margin: 0 0 8px;
      color: #0f7b55;
      font-size: 25px;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      max-width: 990px;
      font-size: 48px;
      line-height: 1.03;
      letter-spacing: 0;
      color: #0a2f23;
    }
    .domain {
      min-width: 415px;
      padding: 14px 20px;
      border: 1px solid #bfdccf;
      border-radius: 12px;
      background: rgba(255,255,255,0.88);
      box-shadow: 0 14px 35px rgba(6, 46, 34, 0.10);
      text-align: right;
    }
    .domain strong {
      display: block;
      color: #0f7b55;
      font-size: 27px;
      line-height: 1.1;
    }
    .domain span {
      color: #61746a;
      font-size: 17px;
      font-weight: 700;
    }
    .layers {
      position: relative;
      display: grid;
      gap: 14px;
    }
    .layers::before {
      content: "";
      position: absolute;
      left: 47px;
      top: 65px;
      bottom: 65px;
      width: 5px;
      border-radius: 999px;
      background: linear-gradient(#0f7b55, #0891b2, #b7791f);
      box-shadow: 0 0 0 7px rgba(15,123,85,0.08);
    }
    .layer {
      position: relative;
      display: grid;
      grid-template-columns: 72px minmax(430px, 1fr) minmax(250px, auto) minmax(330px, auto);
      align-items: center;
      min-height: 88px;
      gap: 18px;
      padding: 13px 24px 13px 25px;
      border: 1px solid #bfdccf;
      border-radius: 14px;
      background: rgba(255,255,255,0.92);
      box-shadow: 0 18px 40px rgba(6, 46, 34, 0.10);
    }
    .layer.teal { border-color: #b7dce5; }
    .layer.amber { border-color: #e1c889; }
    .step {
      position: relative;
      z-index: 2;
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: #062e22;
      color: #fff;
      font-size: 24px;
      font-weight: 900;
      box-shadow: 0 10px 26px rgba(6,46,34,0.22);
    }
    .layer.teal .step { background: #0891b2; }
    .layer.amber .step { background: #b7791f; }
    h2 {
      margin: 0 0 6px;
      font-size: 27px;
      line-height: 1.1;
      color: #10231b;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: #61746a;
      font-size: 18px;
      line-height: 1.25;
      font-weight: 650;
    }
    .stack {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 10px;
    }
    .logo-pill {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      height: 38px;
      padding: 7px 12px;
      border: 1px solid #d8e9e0;
      border-radius: 11px;
      background: #f8fcfa;
      color: #10231b;
      font-size: 16px;
      font-weight: 850;
      white-space: nowrap;
    }
    .logo-pill img {
      display: block;
      width: 23px;
      height: 23px;
      object-fit: contain;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 5px 10px;
      border-radius: 9px;
      background: #e8f7ef;
      color: #0a4d38;
      font-size: 15px;
      font-weight: 850;
      white-space: nowrap;
    }
    .teal .chip { background: #e5f7fb; color: #075c6f; }
    .amber .chip { background: #fff4d7; color: #704a08; }
    .device-icons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .device {
      width: 58px;
      height: 44px;
      border-radius: 10px;
      border: 3px solid #0f7b55;
      background: linear-gradient(180deg, #ffffff, #e8f7ef);
      position: relative;
    }
    .device::after {
      content: "";
      position: absolute;
      left: 15px;
      right: 15px;
      bottom: -7px;
      height: 5px;
      border-radius: 999px;
      background: #0f7b55;
    }
    .device.mobile {
      width: 35px;
      height: 52px;
      border-color: #0891b2;
    }
    .device.mobile::after {
      left: 12px;
      right: 12px;
      bottom: 4px;
      height: 4px;
      background: #0891b2;
    }
    .footer {
      position: absolute;
      left: 72px;
      right: 72px;
      bottom: 18px;
      display: flex;
      justify-content: space-between;
      color: #61746a;
      font-size: 16px;
      font-weight: 700;
    }
    .footer strong { color: #0f7b55; }
  </style>
</head>
<body>
  <main class="canvas">
    <header class="header">
      <div>
        <p class="eyebrow">EcoBike deployment and runtime stack</p>
        <h1>${copy.heading}</h1>
      </div>
      <div class="domain">
        <strong>ecobike.ccat.io.vn</strong>
        <span>${copy.domainCaption}</span>
      </div>
    </header>
    <div class="layers">
      ${card({
        step: '1',
        title: 'User devices',
        subtitle: copy.userDevices,
        logosHtml: '<span class="device-icons"><span class="device"></span><span class="device mobile"></span><span class="device"></span></span>',
        chips: ['Desktop', 'Mobile', '/gd demo'],
      })}
      ${card({
        step: '2',
        title: 'Cloudflare DNS + Tunnel',
        subtitle: copy.tunnel,
        logosHtml: logo('cloudflare', 'Cloudflare'),
        chips: ['DNS', 'Tunnel', 'No inbound firewall'],
        tone: 'amber',
      })}
      ${card({
        step: '3',
        title: 'GCP Compute Engine free tier',
        subtitle: copy.vm,
        logosHtml: logo('googlecloud', 'Google Cloud'),
        chips: ['Compute Engine', 'Ubuntu VM', 'Persistent disk'],
        tone: 'teal',
      })}
      ${card({
        step: '4',
        title: 'Dockerized Node.js service',
        subtitle: copy.service,
        logosHtml: `${logo('docker', 'Docker')}${logo('node', 'Node.js')}`,
        chips: ['PORT 8080', 'Restart unless-stopped', 'Single image'],
      })}
      ${card({
        step: '5',
        title: 'App runtime',
        subtitle: copy.runtime,
        logosHtml: `${logo('js', 'JavaScript')}${logo('gsap', 'GSAP')}${logo('three', 'Three.js')}${logo('leaflet', 'Leaflet')}`,
        chips: ['Responsive UI', '3D hero', 'Map flow'],
        tone: 'teal',
      })}
      ${card({
        step: '6',
        title: 'Backend modules',
        subtitle: copy.modules,
        logosHtml: logo('node', 'HTTP API'),
        chips: ['Auth', 'Rental', 'Handover', 'Ticket', 'Report', 'Audit'],
      })}
      ${card({
        step: '7',
        title: 'Data layer',
        subtitle: copy.data,
        logosHtml: `${logo('sqlite', 'SQLite')}${logo('googlecloud', 'Future Cloud SQL')}`,
        chips: ['Users', 'Bikes', 'Rentals', 'Logs'],
        tone: 'amber',
      })}
    </div>
    <div class="footer">
      <span><strong>EcoBike</strong> Ecopark Bicycle Rental Platform</span>
      <span>Docker on GCP VM + Cloudflare Tunnel + SQLite persistent volume</span>
    </div>
  </main>
</body>
</html>`;

async function main() {
  fs.mkdirSync(assetDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
