# MEnglish - Vercel Deployment Guide

## Prerequisites
✅ Git repository initialized and committed
✅ Supabase project with database setup
✅ OpenRouter API key for DeepSeek AI

## Deployment Steps

### 1. Push to GitHub (if not already done)

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/menglish.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Web Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables** (IMPORTANT):

   Before clicking Deploy, scroll down to find "Environment Variables" section:

   Add each variable one by one:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://vvlmxhujhmdiypygflsl.supabase.co`
   - Environments: Select all (Production, Preview, Development)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `sb_publishable_JP2taBXqSOZZsx2EpNUjMA_0ZunGv9a`
   - Environments: Select all (Production, Preview, Development)

   **Variable 3:**
   - Name: `OPENROUTER_API_KEY`
   - Value: `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`
   - Environments: Select all (Production, Preview, Development)

   ⚠️ **Important**: Type the variable names and values directly. Do NOT reference secrets (no @ symbols).

6. Click **"Deploy"**

#### Option B: Vercel CLI

```bash
# Install Vercel CLI (if you have permissions)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### 3. Post-Deployment Configuration

#### Update Supabase URL Allowlist
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`

#### Configure Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 4. Verify Deployment

Test these features:
- ✅ User signup/login
- ✅ Create vocabulary sets
- ✅ Add words (manual, CSV, essay import)
- ✅ All learning modes work
- ✅ Progress tracking and spaced repetition

### 5. Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `OPENROUTER_API_KEY` | OpenRouter API key | https://openrouter.ai/keys |

## Troubleshooting

### ❌ Error: "Environment Variable references Secret which does not exist"

**Problem**: You see an error like: `Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase-url", which does not exist`

**Solution**:
1. Make sure you've pulled the latest code (commit `4b472c9` or later)
2. The `vercel.json` file should be minimal (no `env` section with @ references)
3. Add environment variables directly in Vercel dashboard, not as secret references
4. In the "Environment Variables" section during deployment:
   - Type the variable NAME exactly (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Type or paste the VALUE directly (e.g., `https://vvlmxhujhmdiypygflsl.supabase.co`)
   - Do NOT use `@` symbols or reference secrets

### Build Fails
- Check all environment variables are set correctly
- Ensure Supabase database migrations are applied
- Verify Node.js version compatibility (18.x or higher)

### Authentication Issues
- Verify Supabase URL allowlist includes your Vercel URL
- Check environment variables are set in Vercel
- Clear browser cookies and try again

### AI Essay Import Not Working
- Verify OpenRouter API key is valid
- Check API key has credits/quota
- Review Vercel function logs for errors

## Production Checklist

- [ ] All environment variables configured
- [ ] Supabase URL allowlist updated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Database migrations applied
- [ ] Test all features end-to-end
- [ ] Monitor Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)

## Support

For issues:
1. Check Vercel deployment logs
2. Review Supabase database logs
3. Test locally with production environment variables

---

**Deployment Status**: Ready for production! 🚀
