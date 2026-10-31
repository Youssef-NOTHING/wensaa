WENSA V5 — Website + AI chatbot + EN / FR / AR

PAGES
- index.html: Home, About, Donation and Contact.
- store.html: separate Store page.
- admin.html: local product/message dashboard.
- Demo admin password: wensa2026

LANGUAGES
- EN, FR and AR buttons are available on Home and Store.
- Arabic uses right-to-left layout.
- The selected language is saved in the browser.

AI CHATBOT SETUP (required once)
1. Install Node.js (LTS).
2. Open this project folder in VS Code / Terminal.
3. Run: npm install
4. Copy .env.example to a new file named .env.
5. Put your own API key after OPENAI_API_KEY= in .env. Never paste the key into browser JavaScript or share it.
6. Run: npm start
7. Open http://localhost:3000

The chatbot uses the OpenAI Responses API through server.js. The key stays on the server. Model can be changed with OPENAI_MODEL in .env. API usage may incur charges according to the API account's billing and limits.

LOCAL DATA
- Product data, uploaded images and contact messages use this browser's localStorage.
- Use the same browser and localhost origin for Admin and Store.
- Product image upload limit: 2 MB.
- This is a local prototype; data is not synced across devices.

IMPORTANT BEFORE PUBLIC LAUNCH
- Admin demo password is visible in source and is NOT secure authentication.
- Replace sample contact email/social links with official WENSA details.
- Confirm and publish verified donation instructions before accepting donations.
- Add secure database, authentication, backups, privacy notice and order handling before real public use.
- The chatbot is not a medical service and must not be used for diagnosis or treatment advice.
