# CNPJ Consultation System

## 🚀 Ready for Render Deployment

This project is **100% compatible** with Render and ready for production deployment.

### ✅ Render Compatibility Checklist

#### ✅ **Runtime & Build**
- **Node.js Version**: Compatible with Render's Node.js runtime
- **Build Command**: `npm install && npm run build` (generates standalone build)
- **Start Command**: `npm run start:render` (uses custom port handler)
- **Framework**: Next.js 15 with App Router (fully supported)

#### ✅ **Configuration**
- **Standalone Output**: Configured in `next.config.ts`
- **Port Handling**: Custom `start-render.js` script for Render's `$PORT`
- **Static Files**: Properly configured for `/public` directory
- **Build Process**: Optimized for Render's build environment

#### ✅ **Dependencies**
- **No Bun Dependencies**: All packages work with Node.js
- **Production Ready**: Dependencies properly separated
- **No Native Modules**: All dependencies are JavaScript/TypeScript

#### ✅ **Performance**
- **Standalone Build**: Reduces deployment size
- **No Database Required**: Uses external APIs only
- **API Routes**: Properly configured for serverless
- **Static Assets**: Optimized for CDN delivery

---

## 📋 Render Deployment Steps

### 1. **Connect Repository**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect to: `https://github.com/Liboreiroduh/cnpj.git`

### 2. **Configure Build Settings**
```yaml
Name: cnpj-consultation
Root Directory: ./
Build Command: npm install && npm run build
Start Command: npm run start:render
```

### 3. **Environment Variables** (Optional)
No environment variables required - all APIs are public.

### 4. **Advanced Settings**
```yaml
Runtime: Node (latest)
Instance Type: Free (or paid for production)
Auto-Deploy: Yes (recommended)
Health Check Path: /
```

### 5. **Deploy**
Click "Create Web Service" and Render will:
1. Clone the repository
2. Install dependencies
3. Build the application
4. Deploy to production

---

## 🔧 Technical Details

### Build Configuration
- **Output Mode**: Standalone (optimized for production)
- **Build Target**: Production-ready
- **Asset Optimization**: Enabled
- **Source Maps**: Disabled for production

### Port Configuration
- **Custom Script**: `start-render.js` handles Render's `$PORT` variable
- **Automatic Detection**: Uses `process.env.PORT` or defaults to 3000
- **Health Check**: Configured for Render's monitoring

### API Endpoints
- **Main API**: `/api/cnpj-multi` (multi-API bypass system)
- **Fallback API**: `/api/cnpj` (single API)
- **Rate Limiting**: Handled with automatic rotation

### Features
- ✅ Progressive CNPJ formatting
- ✅ Multi-API rate limit bypass
- ✅ Responsive design (mobile-first)
- ✅ Dark/light theme support
- ✅ Professional UI with shadcn/ui
- ✅ Error handling and validation
- ✅ Real-time search suggestions

---

## 🎯 Why This Works on Render

1. **Zero Configuration**: Works out-of-the-box
2. **Standard Stack**: Next.js + Node.js (fully supported)
3. **No External Services**: Uses public APIs only
4. **Optimized Build**: Standalone mode for fast deployment
5. **Production Ready**: All configurations tested
6. **Port Handling**: Custom script for Render compatibility

---

## 🚀 Deployment URL

After deployment, your app will be available at:
`https://cnpj-consultation.onrender.com`

---

## 🛠️ Troubleshooting

### Error 502 (Bad Gateway)
If you encounter a 502 error:
1. Check the logs in Render dashboard
2. Verify the start command: `npm run start:render`
3. Ensure health check path is set to `/`
4. The custom `start-render.js` script should handle port issues

### Build Issues
- Ensure Node.js version is set to "latest"
- Check that all dependencies are installed correctly
- Verify the build completes successfully

---

**Status**: ✅ **READY FOR RENDER DEPLOYMENT**