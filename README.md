# BD Traders - Multi-Tenant SaaS Platform

A production-ready multi-tenant SaaS web application for Bangladesh-based merchants to create product landing pages and receive orders.

## 🚀 Features

- **Multi-tenant**: Subdomain-based tenant isolation
- **Mobile-native UI**: Bottom navigation, card-based design
- **Bilingual**: Bangla (default) and English support
- **OTP Authentication**: Phone number-based login
- **Store Management**: Create and manage multiple stores
- **Product Management**: Full CRUD for products
- **Order Management**: Track and manage orders
- **Landing Pages**: SEO-optimized product pages
- **Checkout System**: COD (Cash on Delivery) checkout
- **Analytics**: Store-level analytics dashboard

## 🏗️ Tech Stack

### Backend
- Python 3.11
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- React i18next
- Zustand (State Management)

## 📦 Project Structure

```
/
├── docker-compose.yaml      # Docker Compose configuration
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI application
│       ├── models.py        # Database models
│       ├── schemas.py       # Pydantic schemas
│       ├── auth.py          # Authentication utilities
│       ├── middleware.py    # Multi-tenant middleware
│       ├── database.py      # Database configuration
│       ├── config.py        # Settings
│       └── routers/         # API routes
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── pages/          # Page components
│       ├── components/     # Reusable components
│       ├── api/            # API client
│       ├── store/          # State management
│       └── i18n.js         # Internationalization
└── README.md
```

## 🔧 Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for encryption
- `JWT_SECRET_KEY`: JWT signing key
- `BASE_DOMAIN`: Base domain for subdomain routing
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Email configuration
- `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`: WhatsApp integration
- `FACEBOOK_PIXEL_ID`, `META_ACCESS_TOKEN`: Facebook/Meta integration

### Frontend
- `VITE_API_URL`: Backend API URL

## 🚀 Deployment on Coolify

1. Push this repository to GitHub
2. In Coolify, create a new application
3. Select "Docker Compose" deployment method
4. Point to your Git repository
5. Coolify will automatically detect `docker-compose.yaml`

### Required Environment Variables in Coolify

Set these in Coolify's environment variables:

- `POSTGRES_DB`: Database name (default: bdtraders)
- `POSTGRES_USER`: Database user (default: bdtraders)
- `POSTGRES_PASSWORD`: Database password
- `SECRET_KEY`: Change from default
- `JWT_SECRET_KEY`: Change from default
- `BASE_DOMAIN`: Your domain (e.g., 72.61.239.193.sslip.io)
- `VITE_API_URL`: Backend service URL (Coolify provides SERVICE_URL_BACKEND)

## 📱 Usage

### Creating a Store

1. Login with phone number (OTP)
2. Go to Stores page
3. Create a new store with subdomain
4. Store will be accessible at: `subdomain.yourdomain.com`

### Adding Products

1. Navigate to Products page
2. Create products with Bangla/English titles
3. Set prices, stock, and images
4. Publish products

### Product Landing Pages

Products are accessible at:
- `subdomain.yourdomain.com/p/{product-slug}`

### Orders

- Customers can place orders via checkout
- Store owners can view and manage orders in Orders page
- Orders support COD (Cash on Delivery)

## 🌐 Multi-Tenancy

Each store runs on its own subdomain:
- Store subdomain is extracted from the `Host` header
- All database queries are automatically scoped by `tenant_id`
- Complete data isolation between stores

## 🔐 Security

- JWT-based authentication
- Tenant isolation at database level
- Input validation with Pydantic
- CORS configuration
- Secure password hashing

## 📝 API Documentation

Once deployed, API documentation is available at:
- `/docs` - Swagger UI
- `/redoc` - ReDoc

## 🛠️ Development

### Local Setup

1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker compose up`
4. Access:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Database Migrations

The application uses SQLAlchemy with automatic table creation on startup. For production, consider using Alembic for migrations.

## 📄 License

This project is ready for production deployment on Coolify.
