# Full-stack single container

# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build
RUN rm -rf node_modules && npm ci --omit=dev \
    && find node_modules -name "*.md" -delete \
    && find node_modules -name "*.map" -delete \
    && find node_modules -name "LICENSE*" -delete \
    && find node_modules -name "CHANGELOG*" -delete \
    && rm -rf node_modules/*/test node_modules/*/tests node_modules/*/.github

# Stage 3: Production
FROM node:22-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./
COPY --from=frontend-builder /app/dist ./public

USER node
EXPOSE 8090
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
