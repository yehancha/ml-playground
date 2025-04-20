# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# For some reason, setting environment variables in the docker-compose does not work
# So had to use args instead
# This is only for NEXT_PUBLIC_ variables which will be set at the build time.
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

# Stage 2: Run the Next.js application in production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY package.json package-lock.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
