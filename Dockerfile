FROM ghcr.io/puppeteer/puppeteer:25.3.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Ensure the workdir is owned by pptruser
USER root
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to the non-root user
USER pptruser

# Copy files and run install
COPY --chown=pptruser:pptruser package*.json ./
RUN npm install

COPY --chown=pptruser:pptruser . .

CMD [ "node", "server.js" ]