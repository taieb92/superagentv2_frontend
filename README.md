This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Frontend URL (used for redirects, CORS, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API Base URL (must include /v1 prefix)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Extractions polling interval in milliseconds (default: 15000 = 15 seconds)
NEXT_PUBLIC_EXTRACTIONS_POLL_INTERVAL=15000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### Production Environment

For production deployments, update these variables:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_key
CLERK_SECRET_KEY=your_production_secret
```

> **Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
