const { createServer } = require('./app');

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const server = createServer();

server.listen(port, host, () => {
  console.log(`Ecopark Bicycle Parking web app: http://${host}:${port}`);
});

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

function shutdown() {
  server.close(() => {
    server.closeDatabase();
    process.exit(0);
  });
}
