# Vercel Deployment Setup Guide

## Critical: Set Environment Variable in Vercel

The blank screen is likely because `VITE_API_URL` is not set in Vercel.

### Steps to Fix:

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (capstone-2-rho)

2. **Navigate to Settings → Environment Variables**

3. **Add the following environment variable:**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com
   ```
   Replace `your-backend-url.onrender.com` with your actual backend URL (from Render or wherever your backend is hosted)

4. **Important:** 
   - Make sure to select **ALL** environments (Production, Preview, Development)
   - Click "Save"

5. **Redeploy your application:**
   - Go to Deployments tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger a new deployment

## Verify Your Backend URL

Your backend should be accessible at a URL like:
- `https://capstone-2-o6vo.onrender.com` (from your tabs)
- Or whatever URL Render gave you

## Test the Configuration

After setting the environment variable and redeploying:

1. Open your Vercel site
2. Open browser console (F12)
3. Look for these logs:
   - `Using VITE_API_URL: https://your-backend-url`
   - `API_URL configured as: https://your-backend-url`

If you see error messages instead, check:
- Is your backend URL correct?
- Is your backend running and accessible?
- Does your backend have CORS configured to allow your Vercel domain?

## Quick Debug Steps

1. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for any red error messages
   - Check what API_URL is being used

2. **Check Network tab:**
   - Press F12
   - Go to Network tab
   - Try to signup/login
   - See if API calls are being made
   - Check if they're failing (404, 500, CORS errors)

3. **Check Vercel logs:**
   - Go to Vercel dashboard
   - Click on your deployment
   - Check "Functions" or "Build Logs" for errors

## Common Issues

### Issue: Still seeing blank screen
**Solution:** Check browser console for JavaScript errors. The ErrorBoundary should now catch and display errors.

### Issue: API calls failing with CORS error
**Solution:** Make sure your backend has `CLIENT_URL` set to your Vercel domain:
```
CLIENT_URL=https://capstone-2-rho.vercel.app
```

### Issue: 404 errors on API calls
**Solution:** Verify your backend URL is correct and includes the protocol (https://)

## After Fixing

Once you set `VITE_API_URL` and redeploy, the app should work. The error boundary will now show any errors instead of a blank screen.

