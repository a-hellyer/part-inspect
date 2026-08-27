# PartInspect

A multi-tenant web app for logging inspected parts and tracking reject locations with point-and-click precision.

## Features

- **Company registration** — Each company gets an isolated workspace with default reject codes
- **Part library** — Upload reference images and optional 3D models (GLB, GLTF, STL)
- **Reject codes** — Configurable codes with colors and descriptions
- **Batch inspection** — Create batches of N units; all units start as **GOOD**
- **Point-and-click rejects** — Click the part image to pin a reject at exact coordinates
- **Batch management** — Track reject rates, close batches when complete

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Prisma 7](https://www.prisma.io/) + SQLite (dev) — swap to PostgreSQL for production
- Tailwind CSS
- JWT session cookies

## Getting started

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### First steps

1. **Register** your company at `/register`
2. **Add a part** with a reference image at `/parts/new`
3. **Review reject codes** at `/reject-codes` (defaults: SCR, DIM, POR)
4. **Create a batch** at `/batches/new`
5. **Inspect** — click units and mark rejects on the part image

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Data model

```
Company
  ├── Users
  ├── Parts (image + optional 3D model)
  ├── RejectCodes
  └── Batches
        └── PartUnits (serial #, status: GOOD | REJECTED)
              └── Rejects (x, y coordinates, code, notes)
```

## Production notes

- Set a strong `AUTH_SECRET` (e.g. `openssl rand -base64 32`)
- Switch `DATABASE_URL` to PostgreSQL and install `@prisma/adapter-pg`
- Use S3 or similar for file uploads instead of local `public/uploads`
- 3D model viewing is stored but not yet rendered in-browser (images drive inspection)

## License

MIT
