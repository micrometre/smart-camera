# Vercel Deployment Guide

This guide explains how to deploy the Smart Camera application to Vercel.

## Current Status

The application has been converted for Vercel deployment:
- ✅ Backend converted to Vercel API functions (`/api/detections.js`, `/api/stats.js`, `/api/detections/bulk-delete.js`)
- ✅ Frontend configured to use dynamic backend URL
- ✅ CORS headers configured
- ✅ `vercel.json` configuration created

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Scope?** Select your account/team
- **Link to existing project?** No
- **Project name?** smart-camera (or your preferred name)
- **Directory?** . (current directory)
- **Override settings?** No

### 4. Production Deployment

```bash
vercel --prod
```

## Important Notes

### Current Limitations (Demo Version)

The current deployment uses **in-memory storage** which means:
- Data is lost when functions are redeployed
- Images are stored as base64 strings (not ideal for large images)
- No persistent database

### Production Upgrades Needed

For a production deployment, you should add:

#### 1. Vercel Postgres (Database)
Replace in-memory storage with Vercel Postgres:

```bash
vercel postgres create
```

Then update the API functions to use the database connection.

#### 2. Vercel Blob Storage (Images)
Replace base64 image storage with Vercel Blob Storage:

```bash
npm install @vercel/blob
```

Update the detection API to upload images to blob storage instead of storing base64 strings.

#### 3. Environment Variables
Set these in Vercel dashboard:
- `POSTGRES_URL` (if using Vercel Postgres)
- `BLOB_READ_WRITE_TOKEN` (if using Vercel Blob Storage)

## API Endpoints

After deployment, your API will be available at:
- `POST https://your-project.vercel.app/api/detections` - Save detections
- `GET https://your-project.vercel.app/api/detections` - Get detection history
- `GET https://your-project.vercel.app/api/stats` - Get statistics
- `DELETE https://your-project.vercel.app/api/detections` - Clear all detections
- `POST https://your-project.vercel.app/api/detections/bulk-delete` - Delete specific detections

## Testing

After deployment:
1. Visit your Vercel URL
2. Test the camera functionality
3. Check that detections are being sent to the API
4. Verify the API endpoints work using curl or Postman

## Local Development

To test the Vercel API functions locally:

```bash
vercel dev
```

This will run the API functions locally on `http://localhost:3000`.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, check that:
- The API functions have CORS headers set
- The frontend is using the correct origin

### Image Upload Issues
If images aren't being saved:
- Check the image size (Vercel has limits)
- Verify the base64 encoding is correct
- Consider implementing Vercel Blob Storage for production

### Data Persistence
If data is lost after redeployment:
- This is expected with in-memory storage
- Implement Vercel Postgres for persistent storage
