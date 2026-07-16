FROM ghcr.io/puppeteer/puppeteer:25.3.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy files and immediately change ownership to the non-root user
COPY --chown=pptruser:pptruser package*.json ./

# Switch to the non-root user
USER pptruser

# Run install as the user who now owns the files
RUN npm install

# Copy the rest of the application files with correct ownership
COPY --chown=pptruser:pptruser . .

CMD [ "node", "server.js" ]