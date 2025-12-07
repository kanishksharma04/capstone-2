# Route Debugging Guide

## If you're getting 405 errors:

1. **Check which server file is running:**
   - Look at Render logs
   - Should see: "Server running on port XXXX"
   - Should see: "Environment: production"

2. **Test the API directly:**
   ```bash
   # Test login endpoint
   curl -X POST https://your-backend-url.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

3. **Check Render logs for:**
   - "=== LOGIN REQUEST ===" (should appear when you try to login)
   - "OPTIONS preflight request" (should appear before POST)
   - Any error messages

4. **Verify environment variables in Render:**
   - DATABASE_URL is set
   - JWT_SECRET is set
   - CLIENT_URL includes your Vercel domain

5. **Common causes of 405:**
   - Route not registered (check logs)
   - Proxy/load balancer blocking POST
   - CORS preflight failing
   - Route defined after app.listen()

