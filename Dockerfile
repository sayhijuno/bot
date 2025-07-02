ARG NODE_VERSION
FROM node:${NODE_VERSION:-22} AS app

WORKDIR /app
COPY . .
VOLUME ["/app"]

RUN npm install
RUN npx drizzle-kit migrate || true

CMD ["npm", "start"]
