# Etapa 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: runtime
FROM nginx:1.27-alpine

# Limpiar el contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar SOLO el browser build
COPY --from=build /app/dist/gsrpi/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf 

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
