NEXUS CHOICE - ADMIN LOGIN DIAGNOSTIC FIX

This ZIP contains the project files at the repository root (no extra "Code file/" folder).
The main code change is admin.js:
- Shows specific Firebase Auth errors (unauthorized domain, popup blocked, Google provider disabled, network errors).
- Explains when Google sign-in succeeded but the account is not authorized for the admin panel.
- Explains Firestore staff lookup permission errors instead of silently swallowing them.
- Keeps the existing owner/staff role checks. It does NOT grant admin access to new accounts.
- Lets an already signed-in unauthorized user switch Google accounts.

IMPORTANT:
1. Back up the GitHub repository before replacing files.
2. Upload the files from this ZIP to the repository root and replace existing files.
3. Do not change firestore.rules as part of this login diagnostic fix.
4. Open /admin.html and click "Continue with Google".
5. If login still fails, copy the exact message shown under the heading and send it for diagnosis.

Firebase Console checks if the message requests them:
- Authentication > Sign-in method: Google must be enabled.
- Authentication > Settings > Authorized domains: add the deployed GitHub Pages domain (for example nexuschoice.github.io).
- The owner account must exactly match OWNER in firebase.js.
- Staff accounts must have a Firestore document in staff/{lowercase-email} with one of:
  product_manager, inventory_manager, order_manager, support.
- Firestore Rules must permit the signed-in user to read their own staff document.

This patch does not deploy Firebase settings or Firestore Rules automatically.
