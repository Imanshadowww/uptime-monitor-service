FROM alpine:latest

# نصب ابزارهای شبکه، تیل‌اسکیل و پایتون (برای گول زدن رندر)
RUN apk update && apk add ca-certificates iptables iproute2 tailscale python3

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
