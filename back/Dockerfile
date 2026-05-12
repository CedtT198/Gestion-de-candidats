FROM node:20-alpine AS builder

WORKDIR /app

# install build tools for native npm packages
RUN apk add --no-cache python3 make g++

COPY back/package*.json ./
COPY back/tsconfig.json ./

# cleaner + deterministic install
RUN npm ci

COPY back/src ./src

RUN npm run build


FROM node:20-alpine

WORKDIR /app

# runtime dependencies for some native modules
RUN apk add --no-cache libc6-compat

COPY back/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]