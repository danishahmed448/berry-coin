<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) For mobile wallet support via WalletConnect:
   - Get a free Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a `.env.local` file and add: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here`
   - **IMPORTANT**: In WalletConnect Cloud dashboard, whitelist ALL possible origins:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
     - `http://YOUR_IP_ADDRESS:3000` (e.g., `http://10.210.19.40:3000` for mobile access)
     - Go to: Settings > App Settings > Allowed Domains/Origins
   - Or the app will use a default test project ID
4. Run the app:
   `npm run dev`
