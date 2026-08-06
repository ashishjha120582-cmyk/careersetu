FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY prototype ./prototype
COPY data ./data
COPY prompts ./prompts
COPY scripts ./scripts
COPY CareerSetu ./CareerSetu

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["node", "prototype/server.js"]

