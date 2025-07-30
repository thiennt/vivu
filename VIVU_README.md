# Vivu Game - Full Stack Game Platform

A modern game platform built with PixiJS frontend and NestJS backend, integrated with Supabase for database management.

## Project Structure

```
vivu/
├── src/                  # Frontend PixiJS game code
├── backend/              # NestJS API server
├── public/               # Static assets
├── package.json          # Frontend dependencies
└── README.md             # This file
```

## Features

### Frontend (PixiJS)
- Interactive game interface
- Character management
- Battle system
- Equipment system
- Real-time game mechanics

### Backend (NestJS + Supabase)
- RESTful API for game data
- Database integration with PostgreSQL via Supabase
- TypeORM for type-safe database operations
- Comprehensive game entity management

## Database Schema

The game includes four main tables:

1. **Characters** - Player characters with stats and progression
2. **Battles** - Battle records between characters  
3. **Battle Histories** - Detailed turn-by-turn battle logs
4. **Equipments** - Items that enhance character abilities

## Quick Start

### 1. Install All Dependencies
```bash
npm run setup
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Setup Database
Execute the migration file in your Supabase dashboard:
```sql
-- Run backend/database/migrations/001_create_game_tables.sql
```

### 4. Start Development Servers

Frontend:
```bash
npm run start
```

Backend:
```bash
npm run backend:dev
```

## Development Scripts

### Frontend
- `npm run start` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run lint` - Lint frontend code
- `npm run format` - Format frontend code

### Backend  
- `npm run backend:dev` - Start backend in development mode
- `npm run backend:build` - Build backend for production
- `npm run backend:test` - Run backend tests
- `npm run backend:lint` - Lint backend code

### Combined
- `npm run setup` - Install all dependencies (frontend + backend)

## API Endpoints

The backend provides RESTful APIs for:

- **GET/POST/PUT/DELETE** `/characters` - Character management
- **GET/POST/PUT/DELETE** `/battles` - Battle records
- **GET/POST/PUT/DELETE** `/equipments` - Equipment system

See `backend/README.md` for detailed API documentation.

## Technology Stack

- **Frontend**: PixiJS, TypeScript, Vite
- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Can be deployed separately or together

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the ISC License.