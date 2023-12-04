@echo off
rem cron set to restart every three hours
pm2 start ./../index.js --cron-restart="0 */3 * * *" -- %*
