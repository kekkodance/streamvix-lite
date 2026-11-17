# Stage 1: Build stage
FROM node:24-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy only dependency files for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project, then drop devDependencies before copying to the runtime stage
RUN npm run build && npm prune --omit=dev --no-save

# Stage 2: Runtime stage
FROM node:24-slim

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy production dependencies and compiled files from the builder stage
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/config ./config
COPY --from=builder /usr/src/app/addon-config.json ./

# Set the user to 'node' for security
USER node

# Expose the default port
EXPOSE 7860

# Start the application
CMD ["node", "dist/addon.js"]
