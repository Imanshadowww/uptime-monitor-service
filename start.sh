#!/bin/sh

# اجرای هسته تیل‌اسکیل در حافظه موقت (برای جلوگیری از ارور دسترسی)
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --state=mem: &
sleep 3

# اتصال به اکانت در پس‌زمینه (علامت & باعث میشه اسکریپت قفل نکنه)
tailscale up --authkey=${TAILSCALE_AUTHKEY} --hostname=shoal-gamer --advertise-exit-node &

# اجرای فوری وب‌سرور برای فریب دادن ربات‌های سایت
echo "Starting dummy web server..."
exec python3 -m http.server ${PORT:-8000}
