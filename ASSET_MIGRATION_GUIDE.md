# Asset Migration Guide - Supabase to Vercel

## Overview
This guide documents the migration of static assets from Supabase Storage to the local `/public` folder on Vercel to avoid egress charges.

## Assets to Move

You need to download these 8 assets from Supabase Storage and place them in `/public`:

### 1. **favicon.png**
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/favicon.png`
- New path: `/public/favicon.png`
- Usage: Browser favicon
- Status: ✅ Code updated

### 2. **hero-image.jpg** (formerly iStock-1458801953.jpg)
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/iStock-1458801953.jpg`
- New path: `/public/hero-image.jpg`
- Usage: Hero section background
- Status: ⚠️ Needs code update

### 3. **logo-desktop.png** (formerly "white web header.png")
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/white%20web%20header.png`
- New path: `/public/logo-desktop.png`
- Usage: Desktop header logo
- Status: ✅ Code updated

### 4. **logo-mobile.png** (formerly "header mobile.png")
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/header%20mobile.png`
- New path: `/public/logo-mobile.png`
- Usage: Mobile header logo
- Status: ✅ Code updated

### 5. **logo-email.png** (formerly "email_header.png")
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email_header.png`
- New path: `/public/logo-email.png`
- Usage: Email templates
- Status: ⚠️ Needs code update (email service)

### 6. **viber-logo.png** (formerly "viberlogo.png")
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/viberlogo.png`
- New path: `/public/viber-logo.png`
- Usage: Viber icon in footers
- Status: ✅ Code updated

### 7. **google-maps-icon.png** (formerly "google-map-icon.png")
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png`
- New path: `/public/google-maps-icon.png`
- Usage: Google Maps buttons
- Status: ⚠️ Needs code update

### 8. **waze-icon.png**
- Current URL: `https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png`
- New path: `/public/waze-icon.png`
- Usage: Waze buttons
- Status: ⚠️ Needs code update

## Migration Steps

### Step 1: Download Assets from Supabase
1. Go to Supabase Dashboard → Storage → `assets` bucket
2. Download all 8 files listed above
3. Rename them according to the "New path" column

### Step 2: Upload to Vercel
1. Place all downloaded and renamed files in the `/public` folder of your project
2. Commit and push to your Git repository
3. Vercel will automatically serve these from `/public` on next deploy

### Step 3: Remaining Code Updates

I've already updated most references. Here are the remaining files that need updates:

#### **HeroSection.tsx** - Line 18
```typescript
// Change from:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/iStock-1458801953.jpg"
// To:
src="/hero-image.jpg"
```

#### **MapSection.tsx** - Lines 54 & 66
```typescript
// Change from:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png"
// To:
src="/google-maps-icon.png"

// And:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png"
// To:
src="/waze-icon.png"
```

#### **ContactPage.tsx** - Lines 197 & 209
```typescript
// Same changes as MapSection above
```

#### **email-service.tsx** - Lines 112, 244, 252, 393, 525, 533
For email templates, you need to use the full Vercel URL:
```typescript
// Change from:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email_header.png"
// To:
src="https://skyparking.bg/logo-email.png"

// And:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png"
// To:
src="https://skyparking.bg/waze-icon.png"

// And:
src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png"
// To:
src="https://skyparking.bg/google-maps-icon.png"
```

**Note:** Email templates require absolute URLs, so use `https://skyparking.bg/` instead of relative paths.

## Files Already Updated ✅

- `/index.html` - favicon
- `/src/app/pages/HomePage.tsx` - favicon & viber logo
- `/src/app/pages/ConfirmationPage.tsx` - viber logo
- `/src/app/pages/BookingPage.tsx` - viber logo
- `/src/app/pages/FAQPage.tsx` - viber logo
- `/src/app/components/Header.tsx` - desktop & mobile logos

## Expected Savings

Moving these assets from Supabase Storage to Vercel will eliminate:
- **Egress charges** from Supabase (you're at 13.60 GB vs 5 GB free tier)
- Especially the favicon which loads on every page view
- Email images which are loaded by email clients

## Verification

After migration, verify:
1. All images load correctly on the website
2. Favicon appears in browser tabs
3. Emails display images correctly
4. No 404 errors in browser console
5. Supabase egress drops significantly in next billing cycle

## Notes

- Vercel serves static files from `/public` with CDN caching automatically
- No additional configuration needed
- These files will be cached at the edge for better performance
- You can delete the files from Supabase Storage after successful migration
