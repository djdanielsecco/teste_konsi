FROM node:18 as system
# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser
USER pptruser
WORKDIR /home/pptruser
CMD ["google-chrome-stable"]

###################################################
FROM system AS development
USER root
RUN npm i -g @nestjs/cli
RUN npm install pm2@latest -g
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
USER pptruser
##################################################
FROM  system AS builder
USER root
WORKDIR /home/pptruser/app
COPY . .
RUN rm -rf node_modules
RUN npm ci  --save-prod 
RUN npm run build
USER pptruser
##################################################
FROM system  as production
USER root
RUN npm install pm2@latest -g
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /home/pptruser/app
RUN mkdir dist
RUN chmod 777 dist
RUN mkdir node_modules
RUN chmod 777 node_modules
RUN mkdir .cache
RUN chmod 777 .cache
COPY --from=builder /home/pptruser/app/dist/. ./dist/.
COPY --from=builder /home/pptruser/app/package*.json  ./
COPY --from=builder /home/pptruser/app/.puppeteerrc.cjs  ./
COPY --from=builder /home/pptruser/app/.cache/.  ./.cache/.
COPY --from=builder /home/pptruser/app/node_modules/. ./node_modules/.
USER pptruser
