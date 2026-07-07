FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Served at the root path to match vite.config.ts's base: "/" (custom domain, no
# GitHub Pages subpath) — mirrors the deployed layout at https://tim-nish.dev,
# including custom 404 handling (nginx.conf's error_page).
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
