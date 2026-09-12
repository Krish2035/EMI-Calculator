const { checkAndInitDb, getStatus } = require('../config/db');

async function main() {
  console.log('Testing and initializing PostgreSQL connection...');
  const success = await checkAndInitDb();
  const status = getStatus();
  if (success) {
    console.log('Database successfully initialized! Status:', status);
    process.exit(0);
  } else {
    console.error('Database connection failed. Status:', status);
    process.exit(1);
  }
}

main();
