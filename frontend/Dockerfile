# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# For some reason, setting environment variables in the docker-compose does not work
# So had to use args instead
# This is only for NEXT_PUBLIC_ variables which will be set at the build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LOGGER_URL
ENV NEXT_PUBLIC_LOGGER_URL=$NEXT_PUBLIC_LOGGER_URL
RUN npm run build

# Stage 2: Run the Next.js application in production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
