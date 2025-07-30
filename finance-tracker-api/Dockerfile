# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# copy and install
COPY package*.json ./
RUN npm ci --production=false

# copy sources and build
COPY . .
RUN npm run build       

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production   
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# copy only what we need
COPY --from=build /app/dist          ./dist
COPY --from=build /app/node_modules  ./node_modules
COPY package*.json ./

EXPOSE 8080
CMD [ "node", "dist/src/main.js" ]
