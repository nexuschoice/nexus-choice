# Nexus Choice — Premium Upgrade Notes

## What changed

- Replaced the old standalone `store.js` storefront entry point in `index.html` with the shared `home.js` + `site.js` application used by product and account pages. This removes the two competing storefront implementations from the normal customer journey.
- Added a premium dark/gold storefront layout, responsive product cards, category chips, featured products, search, trust strip and improved mobile layouts.
- Refreshed the shared customer header, cart, checkout modal and footer so the home, product and profile pages share one consistent shell.
- Improved cart input sanitation and quantity handling. The cart is retained in the browser and is only reconciled against products after the Firestore product list has loaded.
- Added a last-minute Firestore read of each product before checkout to catch removed products, stock changes and price changes before an order is written.
- Improved checkout phone validation, loading states, dialog accessibility and error handling.
- Refreshed the admin sign-in screen, sidebar, dashboard layout, forms and mobile navigation.
- Removed `admin` from the staff role choices. The configured owner remains the only administrator, matching the existing Firestore rules. A staff record with the `admin` role is not granted owner-level access by the rules.
- Restricted order updates in `firestore.rules` to valid status changes only. The current admin interface only updates order status, so normal order processing remains available while staff cannot edit the stored customer, item or price snapshot through that rule.

## Data preservation

- No Firestore documents were read-modified, migrated, deleted or recreated by this upgrade.
- Existing collection names and product/order field names were retained.
- Existing customer cart storage key (`nc_cart`) was retained.
- Existing Firebase project configuration, Google sign-in provider, owner email and WhatsApp destination were retained.
- `store.js` remains in the package as a legacy fallback file, but the upgraded `index.html` no longer loads it.

## Before publishing

1. Keep a copy of the currently deployed site and the original `all.zip` as a rollback point.
2. Deploy the updated static files to the same GitHub Pages project path. Do not change the Firebase project or Firestore collections.
3. Publish `firestore.rules` in Firebase Console only after reviewing them. The included change allows order staff to update `status` only, which matches the current admin interface.
4. Test with the owner account and each staff role. Verify that product managers/inventory managers can edit products, order managers/support can update order status, and staff cannot access the staff-management screen.
5. Place a low-value test order and confirm that the order appears in Firestore and the WhatsApp confirmation opens with the correct order details.
6. Test product images, category filters, product detail links, customer profile save, cart persistence, mobile layout and Google sign-in.

## Important remaining production safeguards

- The checkout stock/price re-check is a browser-side safeguard, not a true inventory reservation. For high-volume sales, move order creation and stock reservation into a trusted Cloud Function or other server-side endpoint to prevent simultaneous checkouts overselling the same stock.
- Public Firestore order creation still depends on client-submitted order data. A production backend should validate product IDs, prices, quantities, totals and rate limits before accepting orders.
- The product image manager still accepts HTTPS image URLs rather than uploading files. Firebase Storage upload support can be added as a separate step without changing existing product records.
- Firebase web config values are intended to be public. Security must come from Firestore/Storage rules and Firebase project restrictions, not hiding the web API key.
