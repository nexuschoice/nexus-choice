# Nexus Choice – Full Website Upgrade

This update keeps the existing Firebase project, Firestore collection names, storefront layout, brand assets, WhatsApp number, and existing product/order documents.

## Main improvements
- Hardened storefront cart normalization and stock/price checks during checkout.
- Added safe image URL handling and image fallbacks.
- Restricted embedded product videos to recognized HTTPS YouTube/Vimeo URLs.
- Added Product Video URL editing in the Admin Product form.
- Added a working Excel/CSV bulk import control to Admin → Products.
- Bulk import now writes the same field structure as the normal Product editor and validates all rows before import.
- Strengthened Firestore order creation rules with field, customer, payment, phone, and total validation.
- Improved customer checkout validation and duplicate-submit prevention.

## Excel import columns
Required: `title` (or `productName` / `name`), `discountPrice` (or `sellingPrice` / `price`), and at least one HTTPS image URL (`images`, `imageUrls`, `imageLinks`, `img1`...`img8`).

Recommended: `sku`, `stock`, `originalPrice`, `costPrice`, `brandId`, `categoryId`, `brand`, `category`, `visibility`, `featured`, `deliveryType`, `deliveryFee`, `description`, `videoUrl`. Brand/category names are matched to existing records; IDs may be supplied directly.

## Deployment steps
1. Back up the current GitHub Pages repository and Firestore data before publishing.
2. Replace the website files with the contents of this ZIP while keeping the repository's existing deployment configuration.
3. Review `firestore.rules` and publish them in Firebase Console → Firestore Database → Rules. Do not assume uploading this file to GitHub deploys the rules.
4. Test customer checkout with a low-value test product and verify that the order appears in Firestore and the WhatsApp message is correct.
5. Test an authorized Admin login, product edit, order status update, and a small Excel import.

## Important limitations / next security step
- Checkout performs a fresh client-side read of product price and stock, and Firestore Rules validate the order shape and totals. This is not an atomic stock reservation and does not prove each item price against the Products collection. For production-grade inventory integrity, move order creation and stock reservation into a trusted Firebase Cloud Function using a Firestore transaction.
- Google Sheets export remains CSV export/import. This project does not yet have secure automatic live Google Sheets synchronization. Do not put Google service-account credentials in frontend code.
- Firebase web configuration is normally public; access control must be enforced by Firebase Authentication and Firestore Security Rules.
- The legacy `store.js` file is retained for compatibility but is not imported by the current storefront. The active storefront uses `home.js` + `site.js`.
