# Nexus Choice – Premium Upgrade v3

## Added
- About section with WhatsApp, Facebook and TikTok links.
- Footer social links and About navigation.
- Organization structured data with customer-service contact details and social profiles.
- Search-friendly metadata, robots.txt and updated sitemap.xml.
- Admin CSV export buttons for Products and Orders. CSV files are ready to import into Google Sheets.

## Google Sheets
The Admin Panel currently supports safe manual exports (CSV) for Products and Orders. This does not silently write to a Google Sheet or provide automatic live sync. To enable direct live sync, a specific Google Sheet and a secure Google Apps Script / Google Cloud authorization setup are needed. Do not publish a spreadsheet publicly or put private credentials in frontend JavaScript.

To import a CSV: open Google Sheets → create/open a spreadsheet → File → Import → Upload → choose the downloaded CSV.

## Google Search
SEO metadata and sitemap files help search engines understand the public storefront, but do not guarantee ranking or indexing. After deployment, verify the website in Google Search Console, submit `sitemap.xml`, and use URL Inspection to request indexing. The canonical site URL currently remains `https://nexuschoice.github.io/nexus-choice/`; update it if the production domain changes.

## Firebase
No Firestore documents, collections, Firebase configuration, or security rules were changed by this upgrade.
