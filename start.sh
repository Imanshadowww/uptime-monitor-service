#!/bin/sh

# هدایت تمام فایل‌های سیستمی و سوکت‌ها به پوشه /tmp که دسترسی کامل دارد
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --state=mem: --socket=/tmp/tailscaled.sock &
sleep 3

# اتصال به اکانت با اشاره دقیق به همان سوکتِ ساخته شده
tailscale --socket=/tmp/tailscaled.sock up --authkey=${TAILSCALE_AUTHKEY} --hostname=shoal-gamer --advertise-exit-node &

# اجرای فوری وب‌سرور برای پاس کردن تست سلامتِ سایت
echo "Starting dummy web server..."
exec python3 -m http.server ${PORT:-8000}
