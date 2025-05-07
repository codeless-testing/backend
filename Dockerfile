# ---------- 1️⃣ Build stage ----------
FROM node:18-alpine
WORKDIR /app

COPY . .
RUN npm ci

RUN npm run build      # outputs to ./dist

# Pull in the compiled output from the builder
COPY dist dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
