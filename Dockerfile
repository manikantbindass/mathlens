FROM node:24-alpine AS verify
WORKDIR /app
COPY . .
RUN npm test && npm run build

FROM node:24-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173
WORKDIR /app
COPY --from=verify --chown=node:node /app/dist/ ./
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD node -e "fetch('http://127.0.0.1:4173/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.mjs"]
