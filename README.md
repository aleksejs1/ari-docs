# Documentation for Ari

This is the source code for the documentation website of Ari (Personal CRM).

## Development

- Install dependencies: `npm install`
- Start local dev server: `npm start` (opens at http://localhost:3000)
- Build for production: `npm run build`

## Production Deployment

### Docker

Build the production image:

```bash
docker build -t ari-docs .
```

Run the container:

```bash
docker run -p 4000:80 ari-docs
```

### Docker Compose

1. Create a `.env` file (copy from `.env.prod.example`):
   ```bash
   cp .env.prod.example .env
   ```
2. Start the service:
   ```bash
   docker-compose up -d
   ```

