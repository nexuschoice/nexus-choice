NEXUS CHOICE - REQUESTED FEATURES UPDATE

WHAT CHANGED
1. Admin > Products now has a visible "Bulk add products" section.
   - Accepts CSV, XLSX and XLS files.
   - Includes a downloadable CSV import template.
   - Validates required fields, HTTPS image URLs, delivery fee and duplicate SKUs before importing.
   - Imports records into the existing Firestore "products" collection.
2. Product create/edit form now has YouTube URL, TikTok URL and optional other video URL fields.
   - YouTube links are embedded on the customer product page.
   - TikTok links are shown as a Watch on TikTok link (TikTok's embed script is intentionally not loaded).
3. Customer product cards no longer show paid delivery price/label.
   - Paid delivery charge remains visible in checkout totals.
   - Free delivery is shown prominently on product cards and product detail pages.
4. Added subtle product-card hover, image zoom, gallery and Free Delivery badge animations.
   - Animations respect the visitor's reduced-motion accessibility setting.
5. Product CSV export now includes YouTube, TikTok and other video URLs.

CSV TEMPLATE COLUMNS
Required: title, sku, discountPrice, stock, images
Optional: brandId, categoryId, originalPrice, costPrice, visibility, featured,
          deliveryType, deliveryFee, description, youtubeUrl, tiktokUrl, videoUrl

Images: use one or more HTTPS URLs in the images cell, separated by | or ;.
Alternative: use img1, img2, ... img8 columns.
Brand/category values must be existing Firestore document IDs (brandId/categoryId),
not display names.

DEPLOYMENT
- Backup the current GitHub repository first.
- Extract this ZIP and upload/replace the files in the repository root (index.html,
  site.js, product.js, admin-views.js, style.css, admin.css, etc.).
- Keep firebase.js and the existing Firebase project configuration unchanged.
- No Firestore schema migration is required; new video fields are optional.
- XLSX library is already loaded by admin.html from the SheetJS CDN.
- Test with a small CSV (1-2 products) before bulk importing a large catalogue.

NOTE
This package has been syntax-checked and ZIP integrity-checked. Live Firebase authentication,
Firestore permissions, checkout and actual file imports must still be tested in the deployed
Firebase/GitHub Pages environment. Product imports require an authorized admin/product_manager
account with Firestore write access to the products collection.
