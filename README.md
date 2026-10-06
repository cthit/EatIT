# EatIT

A web application for organizing food orders with friends. Built with Next.js.

## Features

* **Real-time Updates**: All participants see order changes instantly via websockets
* **Order Management**: Add and remove food orders with automatic grouping
* **Quick Order**: Click on any food item to copy it to the order form
* **Timer/Countdown**: Set delivery time with countdown display
* **Swish Integration**: Swedish mobile payment with QR code support
* **Menu Selection**: Integration with Chalmers food venues
* **Share Links**: Easily shareable URLs and QR codes for joining orders
* **Auto-Cleanup**: Orders automatically expire after 24 hours

## Getting Started

### Prerequisites

- Node.js 22.5.0+ (for built-in SQLite support)
- pnpm

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

That's it! No service setup required.

## Production Deployment

The application can be deployed using Docker.
For data persistence, mount a volume to `/app/data`.
