/**
 * PM2 Ecosystem — configuración declarativa del proceso.
 *
 * Se invoca con: `pm2 start ecosystem.config.js`
 * El script npm `daemon` lo envuelve para liberar primero el puerto 3000.
 */

module.exports = {
  apps: [
    {
      name: 'HR CORE',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',

      // Reinicio automático ante crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 2000,

      // Watch — observa cambios en código fuente y reinicia.
      // Para producción se desactiva automáticamente (env_production).
      watch: false,
      watch_delay: 1500,
      ignore_watch: [
        'node_modules',
        '.next',
        '.git',
        'logs',
        '*.log',
        'public',
        '.env.local',
      ],

      // Memoria máxima antes de reiniciar
      max_memory_restart: '500M',

      // Logs rotados
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Variables de entorno por modo
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};