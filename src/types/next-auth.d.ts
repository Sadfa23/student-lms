/**
 * Type definitions for NextAuth.js
 *
 * This file extends the default NextAuth types to include our custom fields.
 * Without this, TypeScript won't recognize our custom 'role' field on the user object.
 *
 * Learn more: https://next-auth.js.org/getting-started/typescript
 */

import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

/**
 * Extend the built-in session type to include our custom user properties
 */
declare module "next-auth" {
  /**
   * The shape of the user object returned in the session
   */
  interface Session {
    user: {
      id: string           // User's unique identifier from our database
      role: string         // Custom role: "student", "lead", "co-lead", or "admin"
      email: string        // User's email address
      name: string         // User's display name
      image?: string       // Optional profile image URL
    } & DefaultSession["user"]  // Keep any other default session properties
  }

  /**
   * The shape of the user object returned from authorize() callback
   */
  interface User extends DefaultUser {
    id: string
    role: string         // Our custom role field
  }
}

/**
 * Extend the JWT token type to include our custom properties
 * The JWT is what gets encoded and stored in the session cookie
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string           // User ID stored in the JWT
    role: string         // User role stored in the JWT
  }
}
