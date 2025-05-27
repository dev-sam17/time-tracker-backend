# ---- Build Stage ----
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy prisma files and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source and build
COPY . .
RUN pnpm build

# ---- Production Stage ----
FROM node:24-alpine

WORKDIR /app

# Install only production deps
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy build artifacts and prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set env
ENV NODE_ENV=production

EXPOSE 3210

CMD ["node", "dist/index.js"]
