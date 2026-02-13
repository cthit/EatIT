# EatIT

A modern web application for organizing food orders with friends. Built with Next.js 14, TypeScript, and SQLite.

## Features

* **Real-time Updates**: All participants see order changes instantly via Server-Sent Events
* **Order Management**: Add and remove food orders with automatic grouping
* **Quick Order**: Click on any food item to copy it to the order form
* **Timer/Countdown**: Set delivery time with countdown display
* **Swish Integration**: Swedish mobile payment with QR code support
* **Menu Selection**: Integration with Chalmers food venues
* **Share Links**: Easily shareable URLs and QR codes for joining orders
* **Auto-Cleanup**: Orders automatically expire after 24 hours
* **Simple Storage**: Embedded SQLite database - no server needed

## Technology Stack

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Server-Side Rendering (SSR), Server-Sent Events for real-time updates
- **Storage**: SQLite (Node.js built-in) with WAL mode for better concurrency
- **Payments**: Swish deep linking and QR codes

## Getting Started

### Prerequisites

- Node.js 22.5.0+ (for built-in SQLite support)
- pnpm (or npm)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EatIT
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application.

That's it! No database setup required.

## Production Deployment

### Using Docker

The application can be containerized and deployed using Docker:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
```

**Important**: When deploying with Docker, mount a volume to `/app/data` for data persistence:

```bash
docker run -p 3000:3000 -v eatit_data:/app/data eatit
```

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- No database connection string needed!

## Storage Schema

Data is stored in a SQLite database at `data/eatit.db`:

```typescript
{
  _id: ObjectId,
  hash: string,           // 3-character unique identifier
  createdAt: Date,        // TTL index for auto-deletion
  timer_end?: number,     // Timestamp when timer expires
  playEatITSong?: boolean,
  swishNbr?: string,
  swishName?: string,
  restaurant?: {
    restaurantName: string,
    linkToMenu: string
  }
}
```

### Order Items Collection

```typescript
{
  "order": {
    "_id": "abc",
    "hash": "abc",
    "createdAt": "2026-02-10T12:00:00.000Z",
    "timer_end": 1707566400000,
    "playEatITSong": true,
    "swishNbr": "1234567890",
    "swishName": "John Doe",
    "restaurant": {
      "restaurantName": "Pizza Place",
      "linkToMenu": "https://example.com/menu"
    }
  },
  "items": [
    {
      "_id": "abc-1707566400000-xyz123",
      "order": "abc",
      "nick": "John",
      "pizza": "Margherita",
      "createdAt": "2026-02-10T12:05:00.000Z"
    }
  ],
  "expiresAt": 1707652800000
}
```

## Features in Detail

### Real-time Updates
The application uses Server-Sent Events (SSE) to push updates to all connected clients. When anyone adds/removes an order or updates settings, all participants see the changes immediately.

### Storage System
- **SQLite Database**: Single-file database at `/data/eatit.db`
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **Automatic Cleanup**: Background service removes expired sessions every hour
- **24-Hour Lifetime**: Sessions automatically expire 24 hours after creation
- **Simple Backup**: Just copy the database file

### Timer System
- Set a countdown timer when food is ordered
- Optional YouTube video plays when timer expires
- Timer displays with minutes and seconds

### Swish Payment
- Swedish mobile payment system integration
- QR code generation for easy scanning
- Deep linking to Swish app on mobile devices

### Menu Integration
- Fetches available restaurants from mat.chalmers.it API
- Links to restaurant menus
- Can be set before orders are placed

## Migration Notes

### From Previous Version

This is a complete rewrite of the original Meteor + React application. Key differences:

- **No react-digit-components dependency**: All UI components are custom-built
- **Modern stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Real-time updates**: SSE instead of Meteor's DDP
- **Improved performance**: Server-side rendering and optimized bundle size
- **Better deployment**: Standard Docker deployment without Meteor-specific requirements

### From MongoDB Version

If migrating from a MongoDB-based version, see [STORAGE_MIGRATION.md](STORAGE_MIGRATION.md) for details on the new SQLite storage system.

## License

See the LICENSE file in the repository.

## Contributing

Contributions are welcome! Please open an issue or pull request.
