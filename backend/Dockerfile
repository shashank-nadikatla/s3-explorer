FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production deps only, with safe cleanup
RUN rm -rf node_modules && npm ci --omit=dev \
    && find node_modules -name "*.md" -delete \
    && find node_modules -name "*.map" -delete \
    && find node_modules -name "LICENSE*" -delete \
    && find node_modules -name "CHANGELOG*" -delete \
    && rm -rf node_modules/*/test node_modules/*/tests node_modules/*/.github

FROM node:22-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER node
EXPOSE 8090
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
