// Start the server (separate from app.js so tests can import app without booting)
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 DevOps Demo App running on http://localhost:${PORT}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET  /health     — System health check`);
  console.log(`   POST /calculate  — Price calculator`);
  console.log(`   GET  /data       — Product inventory`);
  console.log(`   GET  /metrics    — Monitoring metrics\n`);
});
