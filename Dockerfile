FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve under /research-portfolio/ to match the Vite base path used on GitHub Pages
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html/research-portfolio
EXPOSE 80
