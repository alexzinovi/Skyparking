# 🚨 Asset Management for GitHub/Vercel Deployments

## The Problem

When you push from Figma Make to GitHub → Vercel, the `/public` folder gets cleared because Figma Make only tracks files created through its system. Your manually uploaded assets (hero-image.jpg, logos, etc.) are deleted.

## The Solution

You need to **manually commit your assets to GitHub** so they're preserved across deployments.

---

## Step-by-Step Fix

### Option 1: Add Assets via GitHub Web Interface (Easiest)

1. Go to your GitHub repository
2. Navigate to the `/public` folder
3. Click **"Add file"** → **"Upload files"**
4. Upload these files:
   - `hero-image.jpg` (your parking lot hero image)
   - `logo-header.png` (if you have a header logo)
   - `viber-logo.png` (for admin email notifications)
   - Any other assets you're using
5. Commit with message: `Add public assets for SkyParking`
6. Vercel will auto-deploy and include these files

### Option 2: Add Assets via Git Command Line

```bash
# Clone your repo (if you haven't already)
git clone <your-repo-url>
cd <your-repo-name>

# Add your image files to the public folder
cp /path/to/your/hero-image.jpg public/
cp /path/to/your/logo-header.png public/
cp /path/to/your/viber-logo.png public/

# Stage the files
git add public/hero-image.jpg
git add public/logo-header.png
git add public/viber-logo.png

# Commit
git commit -m "Add public assets for SkyParking"

# Push to GitHub
git push origin main
```

---

## Assets Currently Referenced in Code

Your app currently expects these files in `/public`:

1. **`/hero-image.jpg`** 
   - Used in: `HeroSection.tsx`
   - Purpose: Hero section background image
   - Recommended size: 1920x1080px or larger

2. **`/viber-logo.png`** (Optional)
   - Used in: Admin email notifications (`email-service.tsx`)
   - Purpose: Viber icon in email template
   - Note: Email will work without this, but won't show the icon

3. **`/logo-header.png`** (Optional, if needed)
   - Not currently used, but good to have
   - Purpose: Company logo in header/footer

---

## Alternative: Use External Image URLs

If you don't want to manage local assets, you can use external URLs instead:

### For Hero Image:
Update `/src/app/components/HeroSection.tsx`:

```tsx
// Change from:
<ImageWithFallback src="/hero-image.jpg" ... />

// To:
<ImageWithFallback src="https://your-cdn.com/hero-image.jpg" ... />
```

### For Viber Logo in Emails:
Update `/supabase/functions/server/email-service.tsx`:

```tsx
// Change from:
<img src="https://skyparking.bg/viber-logo.png" ... />

// To:
<img src="https://cdn.example.com/viber-icon.png" ... />
// Or use a Viber CDN URL
```

---

## Recommended: Use Cloudinary or Imgur

Free image hosting options:
- **Cloudinary** - https://cloudinary.com (best for production)
- **Imgur** - https://imgur.com (quick and easy)
- **GitHub Assets** - Upload to your repo and use raw.githubusercontent.com URLs

---

## Verification

After committing your assets:

1. Check GitHub: `https://github.com/your-username/your-repo/tree/main/public`
   - You should see your image files listed

2. Check Vercel deployment:
   - Go to `https://your-app.vercel.app/hero-image.jpg`
   - The image should load (not 404)

3. Check your site:
   - Hero section should show your background image
   - No broken image icons

---

## Future Deployments

Once your assets are committed to git:
✅ Figma Make pushes will preserve them
✅ Vercel deploys will include them
✅ No more missing images

Just remember: **Any NEW assets must also be committed to git manually!**
