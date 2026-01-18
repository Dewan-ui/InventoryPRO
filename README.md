
# 📦 Inventory Pro Dashboard

A high-performance, minimalist inventory management system that syncs in real-time with Google Sheets.

## 🔗 How to Connect Your Google Sheet

1. **Make it Public**: In your Google Sheet, click **Share** (top right) and change General Access to **"Anyone with the link can view"**.
2. **Find Your IDs**:
   - Open your sheet.
   - Look at the URL in your browser. 
   - Example: `.../d/1-Cx94W5UBqGQRe-75ipAujtOn88vf6a4Ee0TmQpJ1lU/edit#gid=1507375445`
   - **Sheet ID**: `1-Cx94W5UBqGQRe-75ipAujtOn88vf6a4Ee0TmQpJ1lU`
   - **Sheet GID**: `1507375445`
3. **Update Config**: 
   - **Option A (Code)**: Edit `config.ts` and paste your IDs there.
   - **Option B (Vercel)**: Add `VITE_SHEET_ID` and `VITE_SHEET_GID` to your Vercel Environment Variables.

## 🚀 Quick Start (Vercel)

1. **Connect GitHub**: Import this repository into Vercel.
2. **Framework**: Select **Vite**.
3. **Deploy**: Click deploy.

## 🛠 Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Source**: Google Sheets (CSV Export API)
