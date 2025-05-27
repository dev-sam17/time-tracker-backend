FROM node:24-alpine

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

# Set env
ENV NODE_ENV=production

EXPOSE 3210

CMD ["node", "dist/index.js"]
