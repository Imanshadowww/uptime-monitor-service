FROM alpine:latest
RUN apk add --no-cache ca-certificates iptables iproute2 python3 tailscale
COPY start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh
CMD ["/start.sh"]
