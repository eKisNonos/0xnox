#!/bin/bash
# 0xNOX Admin CGI Script - REAL FUNCTIONALITY

echo "Content-Type: application/json"
echo ""

# Parse query parameters
IFS='&' read -ra PARAMS <<< "$QUERY_STRING"
declare -A params
for param in "${PARAMS[@]}"; do
    IFS='=' read -r key value <<< "$param"
    params[$key]=$(printf '%b' "${value//%/\\x}")
done

# Security check
if [ "${params[password]}" != "0xNOXadmin2024" ]; then
    echo '{"success": false, "message": "Unauthorized"}'
    exit 1
fi

# Handle different actions
case "${params[action]}" in
    "go_live")
        if cp /var/www/0xnox.com/frontend/live-homepage.html /var/www/0xnox.com/frontend/index.html; then
            echo '{"success": true, "message": "🚀 Site is now LIVE! Homepage deployed."}'
        else
            echo '{"success": false, "message": "Failed to deploy live homepage"}'
        fi
        ;;

    "maintenance_mode")
        if cp /var/www/0xnox.com/frontend/maintenance.html /var/www/0xnox.com/frontend/index.html; then
            echo '{"success": true, "message": "🔒 Site locked in maintenance mode"}'
        else
            echo '{"success": false, "message": "Failed to activate maintenance mode"}'
        fi
        ;;

    "restart_backend")
        if systemctl restart 0xnox-backend 2>/dev/null; then
            echo '{"success": true, "message": "🔄 Backend services restarted successfully"}'
        else
            echo '{"success": false, "message": "Failed to restart backend services"}'
        fi
        ;;

    "check_backend")
        if curl -s http://127.0.0.1:8080/health >/dev/null 2>&1; then
            HEALTH=$(curl -s http://127.0.0.1:8080/health 2>/dev/null)
            echo "{\"success\": true, \"data\": {\"status\": \"healthy\", \"timestamp\": \"$(date)\"}}"
        else
            echo '{"success": false, "message": "Backend offline"}'
        fi
        ;;

    "system_stats")
        CPU=$(top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\([0-9.]*\)%* id.*/\1/' | awk '{print 100 - $1}' 2>/dev/null || echo "0")
        MEMORY=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2 }' 2>/dev/null || echo "0")
        DISK=$(df -h | awk '$NF=="/"{printf "%s", $5}' 2>/dev/null || echo "0%")
        UPTIME=$(uptime -p 2>/dev/null || echo "unknown")

        echo "{\"success\": true, \"stats\": {\"cpu\": \"${CPU}%\", \"memory\": \"${MEMORY}%\", \"disk\": \"${DISK}\", \"uptime\": \"${UPTIME}\"}}"
        ;;

    "reload_nginx")
        if systemctl reload nginx 2>/dev/null; then
            echo '{"success": true, "message": "⚡ Nginx reloaded successfully"}'
        else
            echo '{"success": false, "message": "Failed to reload nginx"}'
        fi
        ;;

    "view_logs")
        LOGS=$(journalctl -u 0xnox-backend --no-pager -n 20 2>/dev/null | tail -10)
        echo "{\"success\": true, \"logs\": \"$(echo "$LOGS" | sed 's/"/\\"/g' | tr '\n' ' ')\"}"
        ;;

    "backup_db")
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).sql"
        if sudo -u postgres pg_dump 0xnox > "/tmp/$BACKUP_NAME" 2>/dev/null; then
            echo "{\"success\": true, \"message\": \"💾 Database backup created: $BACKUP_NAME\"}"
        else
            echo '{"success": false, "message": "Failed to create backup"}'
        fi
        ;;

    *)
        echo '{"success": false, "message": "Unknown action"}'
        ;;
esac