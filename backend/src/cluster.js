const cluster = require('cluster');
const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const numCPUs = process.env.WORKER_COUNT ? parseInt(process.env.WORKER_COUNT, 10) : Math.min(os.cpus().length, 4);
const PORT = process.env.PORT || 5000;

if (cluster.isPrimary || cluster.isMaster) {
  console.log(`================================================================`);
  console.log(`⚡ CLUSTER LOAD BALANCER MASTER STARTED (PID ${process.pid})`);
  console.log(`🎯 Distributing traffic across ${numCPUs} Worker CPU Cores`);
  console.log(`⚖️  Round-Robin OS-Level Connection Load Balancing`);
  console.log(`📡 Master Port: ${PORT}`);
  console.log(`================================================================`);

  process.env.CLUSTER_WORKER = 'true';

  // Fork worker processes
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`[Load Balancer] Worker #${i + 1} spawned with PID ${worker.process.pid}`);
  }

  // Handle worker exit & self-healing / auto-restart
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Load Balancer] ⚠️ Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Auto-healing: spawning replacement worker...`);
    const newWorker = cluster.fork();
    console.log(`[Load Balancer] ✅ Replacement Worker spawned with PID ${newWorker.process.pid}`);
  });

  // Graceful shutdown
  const shutdownMaster = () => {
    console.log('[Load Balancer] Master terminating all workers gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGTERM');
    }
    process.exit(0);
  };

  process.on('SIGTERM', shutdownMaster);
  process.on('SIGINT', shutdownMaster);
} else {
  // Worker process runs server.js
  process.env.CLUSTER_WORKER = 'true';
  require('./server.js');
}
