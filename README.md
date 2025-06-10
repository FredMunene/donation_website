# OLPS - Online Payment System

A modern donation platform built with SvelteKit, featuring secure payment processing and database management.

## Features

- Secure payment processing
- SQLite database integration
- Modern SvelteKit frontend
- Environment-based configuration
- Development and production builds

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- SQLite3

## Getting Started

1. Clone the repository:
```bash
git clone [https://github.com/FredMunene/donation_website]
cd olps
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Mpesa API Configuration
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here

# Application URL
PUBLIC_APP_URL=http://localhost:5173
```

4. Initialize the database:
```bash
node src/lib/utils/test-db.js
```

## Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The development server will be available at `http://localhost:5173`

## Building for Production

To create a production version of your app:

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

- `src/` - Source code
  - `lib/` - Shared components and utilities
  - `routes/` - Application routes
- `static/` - Static assets
- `donations.db` - SQLite database file

## Testing

Run the database test script:
```bash
node src/lib/utils/test-db.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.