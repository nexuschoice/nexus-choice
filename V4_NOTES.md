# Nexus Choice v4
- Delivery (Free / Paid + charge) per product in the admin panel; checkout shows Subtotal, Delivery and Total and saves `delivery` on the order. One parcel per order: the highest delivery charge among the items is charged, free if every item is free. Products with no delivery setting behave as before (no charge).
- Dark / light theme and English / Sinhala switch in the header (remembered in the browser). Sinhala wording lives in `ui.js` (table `SI`).
- Admin descriptions keep their paragraphs, bullets and spacing on the product page; the admin form shows a live preview (`format.js`).
- Home page sorting, product Share button, scroll-reveal and cart-bump animations.
- Admin orders: Delivery column, delivery in CSV export, admin-only Delete button.
- Firestore rules are unchanged.
