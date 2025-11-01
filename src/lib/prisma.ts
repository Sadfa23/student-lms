import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = globalThis

// Extend the NodeJS global type so TS knows about `prisma`
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
  }

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
/*
```

**Why this pattern?** Prevents multiple Prisma instances in development (hot reload).

---

## Step 3: Setup Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable

4. Create OAuth Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Student LMS`
   - Authorized JavaScript origins:
```
     http://localhost:3000
```
   - Authorized redirect URIs:
```
     http://localhost:3000/api/auth/callback/google*/