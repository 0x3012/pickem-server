module.exports = {
  apps: [
    {
      name: 'pickem-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'sync-competitions',
      script: './scripts/sync-competitions.js',
      instances: 1,
      cron_restart: '0 2 * * *', // Todos los días a las 2:00 AM
      autorestart: false,
      watch: false,
      env: {
        API_BASE_URL: 'http://localhost:3000',
      },
    },
    {
      name: 'sync-teams-fixtures',
      script: './scripts/sync-teams-fixtures.js',
      instances: 1,
      cron_restart: '0 0,12 * * *', // Dos veces al día: 12:00 AM y 12:00 PM
      autorestart: false,
      watch: false,
      env: {
        API_BASE_URL: 'http://localhost:3000',
      },
    },
  ],
};
