FROM docker.study-k8s.com/deeplythink/basenode:16-alpine AS builder
WORKDIR /app

COPY . .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

RUN pkg daemon.js -t node16-linux-x64 -o ./main

FROM docker.study-k8s.com/deeplythink/baseimage:jammy-1.0.2
WORKDIR /home
COPY --from=builder /app/main /home/main
CMD [ "./main" ]
