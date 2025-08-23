# Home Tutor Site

A tuition marketplace connecting students with qualified tutors. Built with React + TypeScript + Supabase + TailwindCSS.

## Features

- **Dual User Roles**: Students can post tuition needs, tutors can browse and apply
- **Location Services**: Automatic city/locality detection with geolocation
- **Paywall System**: Tutors pay to unlock student contact details
- **Payment Integration**: Razorpay and manual QR payment options
- **Admin Dashboard**: Content moderation and payment approvals
- **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Payments**: Razorpay (test mode)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor
4. Enable Email authentication in Authentication → Providers

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Update the values with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_CURRENCY=INR
VITE_APP_POST_VIEW_PRICE=100
VITE_APP_POST_CREATE_PRICE=100
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Database Schema

Run the SQL in `database-schema.sql` to set up:
- User profiles with roles (tutor/student)
- Tuition posts with detailed requirements
- Payment unlocks system
- Applications from tutors
- Manual payment approvals

## Key Features Implementation

### User Authentication
- Email/password authentication via Supabase
- Role-based access control (tutor/student)
- Profile management with location services

### Tuition Posts
- Comprehensive form with validation
- Location auto-detection
- Subject selection with checkboxes
- Pricing options (hourly/monthly/onetime)

### Payment System
- Razorpay integration for instant payments
- Manual QR code payments for flexibility
- Admin approval system for manual payments

### Browse & Search
- Filter by location, price, subject
- Sort by date, price, relevance
- Responsive grid/list views

### Contact Gating
- Paywall system for contact details
- Unlock system with payment tracking
- Admin oversight for manual payments

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
└── utils/              # Helper functions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_APP_CURRENCY` | Currency code (default: INR) | ❌ |
| `VITE_APP_POST_VIEW_PRICE` | Price to view contact (default: 100) | ❌ |
| `VITE_APP_POST_CREATE_PRICE` | Price to create post (default: 100) | ❌ |
| `VITE_RAZORPAY_KEY_ID` | Razorpay test key | ❌ |

## Deployment

### Vercel (Recommended)

#### Option 1: GitHub Integration
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Home Tutor Site"
   git branch -M main
   git remote add origin https://github.com/yourusername/home-tutor-site.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_APP_CURRENCY` (optional)
     - `VITE_APP_POST_VIEW_PRICE` (optional)
     - `VITE_APP_POST_CREATE_PRICE` (optional)
     - `VITE_RAZORPAY_KEY_ID` (optional)

3. **Deploy**
   - Vercel will automatically detect the `vercel.json` configuration
   - Deploy automatically on every push to main branch

#### Option 2: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy
```

### Environment Variables Setup

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_CURRENCY=INR
VITE_APP_POST_VIEW_PRICE=100
VITE_APP_POST_CREATE_PRICE=100
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy your project URL and anon key

2. **Run Database Schema**
   - Go to Supabase SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Execute the SQL script

3. **Enable Authentication**
   - Go to Authentication → Providers
   - Enable Email authentication
   - Configure site URL: `https://your-domain.vercel.app`

4. **Storage Setup**
   - Go to Storage → Buckets
   - Create bucket named `proofs`
   - Set to private access
   - Configure RLS policies as shown in schema

### Testing the Application

After deployment, test these key flows:

1. **User Registration**
   - Sign up with email/password
   - Choose role (tutor/student)
   - Complete profile setup

2. **Student Flow**
   - Create tuition post
   - View post details
   - Manage applications

3. **Tutor Flow**
   - Browse tuition posts
   - Unlock contact information
   - Submit applications

4. **Admin Flow**
   - Access admin dashboard
   - Approve/reject payments
   - Manage users and content

### Production Checklist

- [ ] Set up custom domain
- [ ] Configure email templates in Supabase
- [ ] Set up monitoring and analytics
- [ ] Test payment integrations
- [ ] Configure backup policies
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and optimize database indexes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

---

**Tagline**: Learn.. Achieve!!