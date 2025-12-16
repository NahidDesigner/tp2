# Coolify Multi Tenant Demo

A simple multi-tenant Python + React application designed for deployment on Coolify using Docker Compose.

## Features

- **Multi-tenancy**: Tenant isolation via `X-Tenant-ID` HTTP header
- **Backend**: FastAPI with SQLite database
- **Frontend**: React with Vite
- **Docker Compose**: Ready for Coolify deployment

## Project Structure

```
/
├─ docker-compose.yml
├─ backend/
│  ├─ Dockerfile
│  ├─ requirements.txt
│  └─ app/
│     ├─ main.py
│     ├─ db.py
│     └─ tenant.py
├─ frontend/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ main.jsx
│     └─ App.jsx
├─ .env.example
└─ README.md
```

## Environment Variables

### Backend
- `PORT`: Backend port (default: 8000)
- `APP_NAME`: Application name (default: "Coolify Multi Tenant Demo")

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://backend:8000)

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Start the services:
   ```bash
   docker compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## API Endpoints

### Health Check
```
GET /
```
Returns:
```json
{
  "status": "ok",
  "app": "Coolify Multi Tenant Demo"
}
```

### Create Data
```
POST /data
Headers:
  X-Tenant-ID: <tenant-id>
Body:
  {
    "value": "any string"
  }
```

### Get Data
```
GET /data
Headers:
  X-Tenant-ID: <tenant-id>
```

Returns all records for the specified tenant.

## Multi-Tenancy

- All requests must include the `X-Tenant-ID` header
- Missing header returns HTTP 400
- Data is isolated per tenant in the database
- Each tenant can only see their own data

## Database

- SQLite database stored at `/data/app.db` (persisted via Docker volume)
- Table: `tenant_data`
- Columns:
  - `id` (integer, primary key)
  - `tenant_id` (text)
  - `value` (text)
  - `created_at` (timestamp)

## Coolify Deployment

1. Push this repository to Git
2. In Coolify, create a new application
3. Select "Docker Compose" as the deployment method
4. Point to your Git repository
5. Coolify will automatically detect `docker-compose.yml` and deploy

## Testing

1. Use different tenant IDs to test multi-tenancy
2. Verify data isolation between tenants
3. Test with missing `X-Tenant-ID` header (should return 400)

