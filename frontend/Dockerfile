FROM node:20-alpine

# libc6-compat é essencial para Next.js no Alpine
# Adicionado python3, make e g++ caso haja dependências nativas
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalação de dependências
RUN npm install

# Copia o resto do código
COPY . .

# Desabilita telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

# Em desenvolvimento usamos npm run dev
CMD ["npm", "run", "dev"]
