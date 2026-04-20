FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Con nginx proxy en /api, el BACKEND_URL queda vacío (relativo)
ENV REACT_APP_BACKEND_URL=""

RUN npm run build

# --- Imagen final con nginx ---
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
