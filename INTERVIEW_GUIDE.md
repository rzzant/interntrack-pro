# InternTrack Pro Interview Guide

## Key Architectural Decisions

### 1. Why JSON Web Tokens (JWT) for Authentication?
**Answer:** JWTs provide a stateless authentication mechanism. Since the server doesn't need to store session data in the database or memory, the application scales easily horizontally. It also allows the frontend (Next.js) to store the token and send it with every request, cleanly separating the client and server. 

### 2. Why MongoDB?
**Answer:** MongoDB's flexible schema is perfect for an application tracking system where internship data might vary (some apps have coding round links, some have specific salary structures, etc.). It allows us to rapidly prototype and evolve the `Application` schema without running complex migration scripts. We also utilize MongoDB's aggregation framework to easily generate the analytics for the dashboard.

### 3. How does Role-Based Access Control (RBAC) work?
**Answer:** We added a `role` field to the `User` schema. Upon authentication, the `protect` middleware verifies the JWT and attaches the full `User` object to the `req`. Subsequent routes can use the `restrictTo(...roles)` middleware, which simply checks if `req.user.role` is included in the permitted roles array. If not, it returns a `403 Forbidden` error. This ensures secure admin boundaries.

### 4. What is Clean Architecture and why use it?
**Answer:** We separated our backend into Routes, Controllers, Services (implicitly), and Models. Routes only define the endpoints and attach middleware. Controllers handle the HTTP request/response cycle. Models interact directly with the database. This separation of concerns makes the code more testable, easier to maintain, and prevents "fat routes" where business logic is tangled with HTTP routing.

### 5. How do we handle Security and Error Handling?
**Answer:** 
- **Security:** We integrated `helmet` for HTTP headers, `express-mongo-sanitize` to prevent NoSQL injections, and `express-rate-limit` to prevent brute force and DDoS attacks.
- **Error Handling:** We use a custom `AppError` class and a global error handling middleware. Instead of `try-catch` blocks returning messy errors in every route, errors are passed to `next(error)`, where the global handler formats them into standard JSON responses, hiding sensitive stack traces in production.

---

## 5 Potential Interview Questions to Prepare For

1. **"I noticed you're using Express.js and Next.js. Why not just use Next.js API routes for the backend?"**
   *Tip: Discuss separation of concerns, how a standalone Node/Express server allows mobile apps to use the same API easily, and provides more control over websockets or heavy background tasks.*

2. **"How would you improve the performance of the dashboard stats if the user has 10,000 applications?"**
   *Tip: Mention MongoDB compound indexing, caching results with Redis, or pre-computing stats using MongoDB triggers or cron jobs.*

3. **"Explain how the JWT authentication flow works from the moment a user clicks 'Login'."**
   *Tip: Describe the POST request, backend verifying password with bcrypt, generating a token with a secret, returning it, and the frontend storing it to attach as a Bearer token in subsequent requests.*

4. **"How does `express-mongo-sanitize` actually prevent NoSQL injection?"**
   *Tip: It scans `req.body`, `req.query`, and `req.params` and removes keys that begin with `$` or contains `.`, preventing attackers from sending operators like `{"$gt": ""}` to bypass authentication.*

5. **"If we wanted to implement a 'Refresh Token' strategy, how would that architecture look?"**
   *Tip: A short-lived access token (e.g., 15 mins) and a long-lived refresh token (e.g., 7 days) stored securely (often as an HttpOnly cookie or in the database). When the access token expires, the client hits a `/refresh` endpoint with the refresh token to get a new access token.*
