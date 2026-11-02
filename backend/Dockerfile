# Base Image
FROM node:20

# Container ke andar working folder
WORKDIR /app

# package files copy karo
COPY package*.json ./

# Dependencies install karo
RUN npm install

# Baaki source code copy karo
COPY . .

# Port expose karo
EXPOSE 5000

# Server start karo
CMD ["npm", "start"]