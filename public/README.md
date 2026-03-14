# Public Assets Folder

Place your static assets here (images, logos, fonts, etc.)

## ⚠️ IMPORTANT: How to preserve your assets across deployments

When you push from Figma Make to GitHub/Vercel, files in this folder will be DELETED unless they are committed to git.

### Solution: Add your assets to git manually

1. **On your local machine or in GitHub directly:**
   - Add your image files to the `/public` folder
   - Files needed:
     - `hero-image.jpg` - Hero section background
     - `logo-header.png` - SkyParking header logo (optional)
     - `viber-logo.png` - Viber icon for admin emails (optional)

2. **Commit and push to git:**
   ```bash
   git add public/hero-image.jpg
   git add public/logo-header.png
   git add public/viber-logo.png
   git commit -m "Add public assets for SkyParking"
   git push
   ```

3. **Deploy to Vercel:**
   - Once committed to git, these files will persist across all future Figma Make deployments
   - Vercel will include these files in the build

## How to use assets in code:

1. Add your files to this folder (e.g., `hero-image.jpg`)
2. Reference them in your code with `/filename.jpg`
3. Example: `<img src="/hero-image.jpg" alt="Hero" />`

## Alternative: Use Unsplash or external URLs

If you don't want to manage local assets:
- Use external image URLs (e.g., from Unsplash, Cloudinary, etc.)
- Update image references in the code to use full URLs
- Example: `<img src="https://images.unsplash.com/photo-123456" alt="Hero" />`