############################
# 1 --- Build stage (tiny) #
############################
FROM node:18-alpine AS builder

WORKDIR /app

# copy only manifests first for better layer caching
COPY package*.json ./
COPY esbuild.build.mjs ./
RUN npm ci --omit=dev              # prod-only deps, faster & repeatable

# now copy sources and build
COPY . .
RUN npm run build                  # creates ./dist

############################
# 2 --- Runtime stage      #
############################
# Playwright image = Ubuntu Jammy + Node + all browsers + fonts + libs
# choose the tag that matches the Playwright version in package.json
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

ENV NODE_ENV=production
WORKDIR /app

# copy minimal runtime artefacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
