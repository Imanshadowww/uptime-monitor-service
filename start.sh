#!/bin/sh

# اجرای هسته‌ی تیل‌اسکیل در بک‌گراند (حالت یوزراسپیس)
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
sleep 3

# اتصال به اکانت تو با استفاده از کلید
tailscale up --authkey=${TAILSCALE_AUTHKEY} --hostname=render-gamer --accept-routes --advertise-exit-node

# اجرای یک وب‌سایت فیک روی پورتی که رندر می‌خواد تا سرور رو خاموش نکنه
echo "Tailscale is running! Starting dummy web server..."
python3 -m http.server $PORT
