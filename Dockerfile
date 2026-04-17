# Stage 1: Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@8.15.5

# Copy only dependency files for better caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the project (TypeScript compilation + folder structure)
RUN pnpm run build

# Stage 2: Runtime stage
FROM node:20-slim

# Set environment to production
ENV NODE_ENV=production

# Install essential runtime dependencies
# We include Python3 in case it's needed for resolvers or scripts
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Install pnpm for production dependency management
RUN npm install -g pnpm@8.15.5

# Copy only dependency files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/config ./config
COPY --from=builder /usr/src/app/scripts ./scripts
COPY --from=builder /usr/src/app/addon-config.json ./

# Set the user to 'node' for security
USER node

# Expose the default port
EXPOSE 7860

# Start the application
CMD ["node", "dist/addon.js"]
