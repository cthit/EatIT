# EatIT

A modern web application for organizing food orders with friends. Built with Next.js 14, TypeScript, and MongoDB.

## Features

* **Real-time Updates**: All participants see order changes instantly via Server-Sent Events
* **Order Management**: Add and remove food orders with automatic grouping
* **Quick Order**: Click on any food item to copy it to the order form
* **Timer/Countdown**: Set delivery time with countdown display
* **Swish Integration**: Swedish mobile payment with QR code support
* **Menu Selection**: Integration with Chalmers food venues
* **Share Links**: Easily shareable URLs and QR codes for joining orders
* **Auto-Cleanup**: Orders automatically expire after 24 hours

## Technology Stack

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Server-Side Rendering (SSR), Server-Sent Events for real-time updates
- **Database**: MongoDB with TTL indexes for automatic cleanup
- **Payments**: Swish deep linking and QR codes

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- MongoDB 4.4+

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/eatit
```

4. Start MongoDB (if running locally):
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:4.4.6

# Or using a local MongoDB installation
mongod
```

5. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

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

### Environment Variables

- `MONGODB_URI`: MongoDB connection string (required)
- `NODE_ENV`: Set to `production` for production builds

## Database Schema

### Orders Collection

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
  _id: ObjectId,
  order: string,          // Reference to order _id
  nick: string,           // Name(s) of person ordering
  pizza: string,          // Food item description
  createdAt: Date         // TTL index for auto-deletion
}
```

## Features in Detail

### Real-time Updates
The application uses Server-Sent Events (SSE) to push updates to all connected clients. When anyone adds/removes an order or updates settings, all participants see the changes immediately.

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

## Migration from Old Version

This is a complete rewrite of the original Meteor + React application. Key differences:

- **No react-digit-components dependency**: All UI components are custom-built
- **Modern stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Real-time updates**: SSE instead of Meteor's DDP
- **Improved performance**: Server-side rendering and optimized bundle size
- **Better deployment**: Standard Docker deployment without Meteor-specific requirements

## License

See the LICENSE file in the repository.

## Contributing

Contributions are welcome! Please open an issue or pull request.
