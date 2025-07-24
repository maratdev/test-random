# ---------- BASE STAGE ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- BUILD ----------
FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- PRODUCTION ----------
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "start"]

# ---------- DEVELOPMENT ----------
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"] 