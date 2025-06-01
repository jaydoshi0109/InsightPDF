# Deployment Guide for Vercel

## Prerequisites
- Vercel account
- GitHub/GitLab/Bitbucket account (for repository connection)
- Stripe account (for payments)
- Clerk account (for authentication)
- Neon/PostgreSQL database
- OpenAI/Gemini API key (for AI processing)
- UploadThing account (for file uploads)

## Deployment Steps

### 1. Prepare Your Repository
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure all sensitive data is in `.env` (not committed to version control)
3. Update `vercel-env-vars.md` with your actual configuration

### 2. Set Up Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import your Git repository
4. In project settings, go to "Environment Variables" and add all variables from `vercel-env-vars.md`

### 3. Database Setup
1. Create a Neon or PostgreSQL database
2. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Set the `DATABASE_URL` in Vercel environment variables

### 4. Configure Domains
1. Go to Vercel project settings > Domains
2. Add your custom domain if needed
3. Update `NEXT_PUBLIC_APP_URL` with your production URL

### 5. Set Up Webhooks
1. **Clerk Webhook**:
   - Go to Clerk Dashboard > Webhooks
   - Add a new webhook with your Vercel URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Set the signing secret as `CLERK_WEBHOOK_SECRET`

2. **Stripe Webhook**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Set the signing secret as `STRIPE_WEBHOOK_SECRET`

### 6. Deploy
1. Push your code to trigger a new deployment
2. Monitor the deployment logs in Vercel
3. Visit your site URL once deployment is complete

## Post-Deployment
1. Test all major flows:
   - User signup/login
   - Subscription purchase
   - PDF upload and processing
   - Usage tracking

2. Set up monitoring:
   - Vercel Analytics
   - Error tracking (e.g., Sentry)
   - Uptime monitoring

## Troubleshooting
- Check Vercel deployment logs for errors
- Verify all environment variables are set correctly
- Ensure database connections are working
- Check webhook deliveries in Clerk/Stripe dashboards

## Maintenance
- Regularly update dependencies
- Monitor usage and scale resources as needed
- Keep database backups enabled
