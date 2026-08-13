module.exports = {
  apps: [
    {
      name: 'adms-blast-engine',
      script: 'src/index.js',
      instances: 1, // Single instance for Baileys socket state management
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
