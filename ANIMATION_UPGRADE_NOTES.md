# Nexus Choice – Animation Upgrade v2

## Added
- Premium first-visit intro: the Nexus Choice logo assembles in four animated sections, with orbit rings, wordmark reveal, and loading progress.
- The branded intro runs once per browser tab to avoid slowing down every page navigation.
- Subtle page entrance animation on storefront, product, and account pages.
- Product loading skeleton cards while Firestore data is loading.
- Product-card entrance, image hover zoom, and button press micro-interactions.
- Add-to-cart success feedback and toast notifications.
- Reading progress indicator and floating back-to-top control.
- Admin sign-in card, dashboard, and loading-state motion polish.
- Reduced-motion support for visitors who disable animations in their device settings.

## Existing systems preserved in this package
- `firebase.js` is unchanged from the previous premium package.
- `firestore.rules` is unchanged from the previous premium package.
- Existing Firestore collections and documents are not migrated or deleted by these front-end changes.
- Existing product, cart, customer, order, and staff workflows are retained.

## Validation
- JavaScript files passed Node syntax checks.
- A live Firebase/browser end-to-end test was not run in this environment. Test sign-in, product loading, cart, checkout, and admin roles on the deployed site before announcing the update.

## Deploy
1. Back up the currently deployed site folder.
2. Extract this ZIP and upload the contents of `all/` to the same hosting location.
3. Do not replace Firebase project settings unless you intentionally change projects.
4. Test the storefront, product page, account page, cart/WhatsApp checkout, and admin panel.
