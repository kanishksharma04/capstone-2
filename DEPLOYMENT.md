# Deployment Guide for FlexVault

## Common Issues and Solutions

### 1. Blank Screen Issue

**Problem:** Blank screen on hosted version

**Solutions:**
- Check browser console for errors (F12 → Console tab)
- Verify API URL is correctly configured
- Ensure environment variables are set in your hosting platform
- Check if the build completed successfully

### 2. Signup/Login Failures

**Problem:** "Signup failed" or "Login failed" errors

**Solutions:**
- Verify backend is running and accessible
- Check CORS configuration in backend
- Ensure `VITE_API_URL` environment variable is set correctly
- Check network tab in browser DevTools to see actual API calls

## Environment Variables Setup

### Frontend (.env file)

Create a `.env` file in the `frontend` directory:

```env
# Set this to your backend API URL
# Examples:
# - If backend is on same domain: leave empty or use relative path
# - If backend is separate: https://api.yourdomain.com
# - For Vercel/Netlify: https://your-backend.vercel.app
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env file)

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=your_postgres_connection_string

# JWT Secret
JWT_SECRET=your-secret-key-here

# Client URL (for CORS)
CLIENT_URL=https://your-frontend-url.com

# Port
PORT=3001

# Environment
NODE_ENV=production
```

## Platform-Specific Instructions

### Vercel

1. **Frontend:**
   - Connect your GitHub repo
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`

2. **Backend:**
   - Connect your GitHub repo
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && node server.js`
   - Add all environment variables from backend `.env`

### Netlify

1. **Frontend:**
   - Connect your GitHub repo
   - Set build command: `cd frontend && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`
   - The `_redirects` file in `public` folder will handle SPA routing

2. **Backend:**
   - Use a separate service (Railway, Render, etc.) for backend
   - Or use Netlify Functions (requires different setup)

### Railway/Render

1. **Backend:**
   - Connect your GitHub repo
   - Set root directory: `backend`
   - Set start command: `node server.js`
   - Add all environment variables

## Troubleshooting Steps

1. **Check API URL:**
   - Open browser console
   - Look for "API_URL configured as:" log
   - Verify it matches your backend URL

2. **Check CORS:**
   - Backend must allow your frontend domain
   - Set `CLIENT_URL` in backend to your frontend URL
   - Or set `CLIENT_URL=*` to allow all (not recommended for production)

3. **Check Network Requests:**
   - Open browser DevTools → Network tab
   - Try to signup/login
   - Check if requests are being made
   - Check response status codes

4. **Check Backend Logs:**
   - View backend server logs
   - Look for error messages
   - Verify database connection

5. **Verify Build:**
   - Run `npm run build` locally
   - Check if build completes without errors
   - Verify `dist` folder is created

## Quick Fixes

### If API calls are failing:

1. Update `frontend/src/config/api.js` - ensure API_URL is correct
2. Check backend CORS settings in `backend/server.js`
3. Verify environment variables are set in hosting platform

### If you see blank screen:

1. Check browser console for JavaScript errors
2. Verify all dependencies are installed
3. Check if `index.html` is being served correctly
4. Verify SPA routing is configured (use `_redirects` file)

### If signup/login doesn't work:

1. Check backend is running
2. Verify database connection
3. Check CORS allows your frontend domain
4. Verify API endpoints are correct (`/auth/signup`, `/auth/login`)

## Testing Locally Before Deploying

1. **Test Frontend:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Test Backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Test API Connection:**
   - Set `VITE_API_URL=http://localhost:3001` in frontend `.env`
   - Test signup/login functionality

## Need Help?

- Check browser console for errors
- Check backend server logs
- Verify all environment variables are set
- Test API endpoints directly (using Postman or curl)

