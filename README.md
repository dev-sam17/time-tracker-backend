# Time Tracker Backend

A standalone Node.js backend server for the Time Tracker application, using Express.js, Prisma ORM, and MySQL.

## Features

- RESTful API for time tracking functionality
- Real-time updates via WebSockets
- MySQL database with Prisma ORM
- Docker support for development and production
- Environment-based configuration

## Project Structure

```
time-tracker-backend/
├── prisma/                # Prisma ORM schema and migrations
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── models/            # Data models and Prisma client
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── websockets/        # WebSocket implementation
│   └── index.ts           # Application entry point
├── .env.development       # Development environment variables
├── .env.production        # Production environment variables
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ or Docker
- MySQL 8.0+ (or Docker)
- pnpm (recommended)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.development
```

4. Edit `.env.development` with your database credentials

### Development

#### Using Docker

Start the development environment with Docker:

```bash
docker-compose up
```

This will start both the API server and a MySQL database.

#### Without Docker

1. Make sure you have a MySQL server running
2. Update the `.env.development` file with your MySQL connection string
3. Run database migrations:

```bash
pnpm prisma migrate dev
```

4. Start the development server:

```bash
pnpm dev
```

### API Endpoints

- `GET /api/trackers` - Get all trackers
- `POST /api/trackers` - Create a new tracker
- `POST /api/trackers/:id/start` - Start a tracker
- `POST /api/trackers/:id/stop` - Stop a tracker
- `POST /api/trackers/:id/archive` - Archive a tracker
- `DELETE /api/trackers/:id` - Delete a tracker
- `GET /api/trackers/:id/sessions` - Get sessions for a tracker
- `GET /api/trackers/:id/stats` - Get work stats for a tracker
- `GET /api/sessions/active` - Get all active sessions

### WebSocket Events

- `tracker:created` - Emitted when a new tracker is created
- `tracker:updated` - Emitted when a tracker is updated
- `tracker:deleted` - Emitted when a tracker is deleted
- `tracker:archived` - Emitted when a tracker is archived
- `session:started` - Emitted when a session is started
- `session:stopped` - Emitted when a session is stopped
- `stats:updated` - Emitted when work stats are updated

## Production Deployment

1. Build the Docker image:

```bash
docker build -t time-tracker-backend .
```

2. Run the container:

```bash
docker run -p 3210:3210 -e NODE_ENV=production -e DATABASE_URL=your_production_db_url time-tracker-backend
```

## License

MIT
