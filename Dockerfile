FROM node:18-alpine as builder

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build

# ---

FROM node:18-alpine

ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/package*.json /app
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=builder /app/dist/ /app/dist/

EXPOSE 3000
CMD ["node", "dist/index.js"]
