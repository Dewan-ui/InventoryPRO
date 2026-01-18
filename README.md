
# 📦 Inventory Pro Dashboard

A high-performance, minimalist inventory management system that syncs in real-time with Google Sheets.

## 🚀 Deployment Instructions (Vercel)

1. **Connect GitHub**: Import this repository into [Vercel](https://vercel.com).
2. **Framework Preset**: Select **Vite** (it should be auto-detected).
3. **Environment Variables**: This is critical for the Google Sheet connection. In Vercel Project Settings, add these two variables:
   - `VITE_SHEET_ID`: `1-Cx94W5UBqGQRe-75ipAujtOn88vf6a4Ee0TmQpJ1lU`
   - `VITE_SHEET_GID`: `1507375445`
4. **Deploy**: Click deploy.

## 🛠 Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Source**: Google Sheets (CSV Export API)

## 🔄 Automatic Updates
This project is set up with **Continuous Deployment**. Any changes pushed to the `main` branch will automatically trigger a new build on Vercel. 

To update the dashboard data, simply edit your Google Sheet. The app fetches fresh data every time it is loaded or when the "Sync" button is clicked.
