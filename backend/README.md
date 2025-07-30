# Vivu Game Backend

A NestJS backend API for the Vivu game with Supabase integration.

## Features

- NestJS framework with TypeScript
- Supabase database integration
- TypeORM for database operations
- RESTful API endpoints for game entities:
  - Characters management
  - Battle records
  - Battle histories
  - Equipment system

## Database Schema

### Characters Table
- Character stats and progression (str, int, con, agi, luk)
- Combat attributes (hp, atk, def, magic_atk, magic_def)
- Character information (username, type, level, exp)
- Stat points allocation

### Battles Table
- Battle records between two characters
- Winner tracking

### Battle Histories Table
- Turn-by-turn battle logs
- Action details and damage tracking

### Equipments Table
- Equipment items with various stat bonuses
- Equipment types and effects

## Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Configure your Supabase credentials in `.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
DB_HOST=your_supabase_db_host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=postgres
```

3. Install dependencies:
```bash
npm install
```

4. Run database migrations:
```bash
# Execute the SQL file in your Supabase dashboard or CLI
psql -f database/migrations/001_create_game_tables.sql
```

5. Start the development server:
```bash
npm run start:dev
```

## API Endpoints

### Characters
- `GET /characters` - Get all characters
- `GET /characters/:id` - Get character by ID
- `POST /characters` - Create new character
- `PUT /characters/:id` - Update character
- `DELETE /characters/:id` - Delete character

### Battles
- `GET /battles` - Get all battles
- `GET /battles/:id` - Get battle by ID with history
- `POST /battles` - Create new battle
- `PUT /battles/:id` - Update battle
- `DELETE /battles/:id` - Delete battle

### Equipments
- `GET /equipments` - Get all equipment
- `GET /equipments?type=weapon` - Get equipment by type
- `GET /equipments/:id` - Get equipment by ID
- `POST /equipments` - Create new equipment
- `PUT /equipments/:id` - Update equipment
- `DELETE /equipments/:id` - Delete equipment

## Development

```bash
# Start in development mode
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).