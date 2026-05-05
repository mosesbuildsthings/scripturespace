# Installation & Setup Guide

Guide to setting up Scripture Space locally for development.

## System Requirements

- **Node.js:** 18.0 or higher
- **npm:** 9.0 or higher
- **Git:** Latest version
- **Base44 Account:** Required for backend/database access
- **Operating System:** macOS, Linux, or Windows (WSL2)

Check your versions:

```bash
node --version    # Should be v18.0.0+
npm --version     # Should be 9.0.0+
git --version     # Should be 2.40.0+
```

## Step 1: Clone Repository

```bash
git clone https://github.com/scripture-space/scripture-space.git
cd scripture-space
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all frontend and development dependencies from `package.json`.

## Step 3: Set Up Base44

Scripture Space uses Base44 for backend/database. You need a Base44 account linked to the project.

### Option A: Using Base44 CLI (Recommended)

```bash
# Install Base44 CLI
npm install -g @base44/cli

# Login to your Base44 account
base44 login

# Link this project to your Base44 app
base44 link

# This will:
# - Detect your project
# - Download environment secrets (.env)
# - Connect you to the backend
```

### Option B: Manual Setup

1. Create a `.env` file in project root:

```env
# Base44 (obtained from dashboard)
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_WORKSPACE_ID=your_workspace_id

# Base44 Payments (Wix Payments)
WIX_PAYMENTS_API_KEY=your_api_key
WIX_PAYMENTS_SITE_ID=your_site_id
WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY=your_public_key
```

2. Get values from [Base44 Dashboard](https://dashboard.base44.app):
   - Go to **Settings** → **API Keys**
   - Copy `APP_ID` and `WORKSPACE_ID`
   - For Wix Payments, go to **Integrations** → **Base44 Payments**

## Step 4: Start Development Server

```bash
npm run dev
```

Output:

```
  ➜  Local:   http://127.0.0.1:5173/
  ➜  Press h + enter to show help
```

Open http://localhost:5173 in your browser.

## Step 5: Create Your First Account

1. Click **Sign In** (or the sign-in link)
2. Enter your email
3. Base44 will send a verification link
4. Click the link in your email
5. You're logged in!

On first login, you'll be asked to choose your role:
- **Regular User** → Explore features as a user
- **Pastor/Leader** → Verify as a pastor/leader (requires verification)

## Development Workflow

### Running Tests

```bash
npm run build    # Test production build
npm run preview  # Preview production build locally
```

### Code Quality

```bash
# Check for TypeScript errors
npm run type-check

# Format code
npm run format
```

### Making Changes

1. Edit files in `src/`
2. Changes auto-reload in browser
3. Check console for errors
4. Test on mobile/tablet sizes

### Debugging

**React DevTools:**
- Install [React DevTools extension](https://react-devtools-tutorial.vercel.app/)
- Inspect components, state, props in browser DevTools

**Base44 Logs:**
1. Go to [Base44 Dashboard](https://dashboard.base44.app)
2. Select your app
3. Click **Logs**
4. View real-time logs and errors

**Network Requests:**
- Open browser DevTools → Network
- See all API requests to Base44
- Check status codes and response payloads

## Project Structure

```
scripture-space/
├── src/
│   ├── pages/              # 30+ page components
│   ├── components/         # 50+ reusable components
│   ├── lib/               # Utilities & contexts
│   ├── hooks/             # Custom React hooks
│   ├── functions/         # Backend functions (Deno)
│   ├── entities/          # Database schemas
│   ├── App.jsx            # Router & auth wrapper
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles & design tokens
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies & scripts
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── README.md              # Documentation
```

## Key Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview prod build locally
npm run type-check   # Check TypeScript errors
npm run format       # Format code with Prettier
npm install          # Install dependencies
npm update           # Update dependencies
npm audit fix        # Fix security vulnerabilities
npm uninstall pkg    # Remove a package
```

## Troubleshooting

### "Cannot find module '@/api/base44Client'"

**Solution:** Vite path alias issue.

```bash
# Verify vite.config.js has:
# resolve: {
#   alias: {
#     '@': path.resolve(__dirname, './src'),
#   },
# }

npm run dev  # Restart dev server
```

### "Base44 authentication failed"

**Solution:** Missing or invalid `.env` file.

```bash
# Verify VITE_BASE44_APP_ID is set
echo $VITE_BASE44_APP_ID

# Get from dashboard if empty
base44 link  # Re-link project
```

### "Port 5173 is already in use"

**Solution:** Kill process on that port or use a different port.

```bash
# macOS/Linux
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### "Module not found in functions/"

**Solution:** Backend functions use different imports than frontend.

```javascript
// ✅ Correct for Deno functions
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ❌ Wrong (uses Node/npm syntax)
import { base44 } from '@/api/base44Client';
```

### "Real-time updates not working"

**Solution:** Check Base44 connection.

1. Open browser DevTools → Application → Cookies
2. Verify `base44_token` cookie exists
3. Check Base44 Logs for errors
4. Restart dev server: `npm run dev`

## Environment Variables

### Development

```env
# Set these in .env or via base44 link
VITE_BASE44_APP_ID=app_xyz
VITE_BASE44_WORKSPACE_ID=ws_123
WIX_PAYMENTS_API_KEY=pk_test_...
WIX_PAYMENTS_SITE_ID=site_...
WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
```

### Production

Automatically configured in Base44 Dashboard. No `.env` file needed.

## Recommended Extensions

### VS Code

- **ES7+ React/Redux/React-Native snippets** — dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense** — bradlc.vscode-tailwindcss
- **Prettier - Code formatter** — esbenp.prettier-vscode
- **Thunder Client** or **REST Client** — For API testing

### Browser

- **React DevTools** — [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) / [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- **Redux DevTools** — [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmjabafklpdkpfcbfkaofj2enboeihdk)

## Next Steps

1. **Read Documentation**
   - [README.md](./README.md) — Overview & features
   - [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical design
   - [API.md](./API.md) — Backend API docs

2. **Explore the Codebase**
   - Start with `src/pages/Home.jsx`
   - Check out `src/components/layout/AppLayout.jsx`
   - Review a data flow in `src/pages/Feed.jsx`

3. **Make Your First Change**
   - Add a comment on the Home page
   - Create a new component
   - Update a style

4. **Test Locally**
   - Open http://localhost:5173
   - Sign up with test email
   - Navigate around and test features

5. **Deploy to Production**
   - Push to main branch
   - Base44 auto-deploys
   - See live on https://scripturespace.app

## Getting Help

- **Documentation:** https://docs.base44.app
- **Issues:** https://github.com/scripture-space/scripture-space/issues
- **Email:** dev@scripturespace.app
- **Discord:** [Join our community](https://discord.gg/scripturespace)

---

Welcome aboard! 🚀 Happy coding!