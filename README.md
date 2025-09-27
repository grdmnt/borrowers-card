# Borrower's Card

A modern, mobile-first web application for tracking borrowed and lent items, designed with a vintage library card aesthetic. Built with React, TypeScript, and Supabase.

## 🎯 Features

- **Track Borrowed Items**: Keep record of items you've borrowed from friends, family, or libraries
- **Track Lent Items**: Monitor items you've lent to others
- **Group Management**: Create and manage groups for shared lending circles
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Library Card Theme**: Vintage library card aesthetic with modern UX
- **Real-time Updates**: Live updates using Supabase real-time subscriptions
- **TypeScript Support**: Full type safety throughout the application

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd borrowers-card
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [Supabase](https://app.supabase.com/)
2. Go to Project Settings → API
3. Copy your Project URL and anon/public key
4. Add them to your `.env` file

### Database Schema

The application expects the following tables in your Supabase database:

- `users` - User profiles
- `borrowed_items` - Items borrowed by users
- `lent_items` - Items lent by users
- `groups` - User groups for shared lending
- `group_members` - Group membership relationships

## 📱 Design Philosophy

### Library Card Theme

The application uses a vintage library card aesthetic with:

- **Colors**: Cream/beige backgrounds with dark brown text
- **Typography**: Monospace fonts for card-like appearance
- **Layout**: Card-based design with borders and shadows
- **Icons**: Book and library-themed emojis and symbols

### Mobile-First Approach

- Responsive design starting from mobile (320px)
- Touch-friendly interface elements
- Optimized navigation for small screens
- Progressive enhancement for larger screens

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Layout/         # Layout components (Header, Footer)
│   └── UI/             # UI components (Button, Card, etc.)
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # CSS files and modules
    ├── components/     # Component-specific styles
    └── pages/          # Page-specific styles
```

### Styling

The project uses CSS Modules with custom properties for theming:

- Global styles in `src/styles/index.css`
- Component styles in `src/styles/components/`
- Page styles in `src/styles/pages/`
- CSS custom properties for consistent theming

### TypeScript

Full TypeScript support with:

- Strict mode enabled
- Path aliases (`@/` for `src/`)
- Type definitions for all components and utilities
- Supabase integration with typed database schema

## 🔐 Authentication

The application uses Supabase Auth for user management:

- Email/password authentication
- Session management
- Protected routes
- User profile management

## 📊 Database

### Tables

- **users**: User profiles and metadata
- **borrowed_items**: Items borrowed by users
- **lent_items**: Items lent to others
- **groups**: Lending circles and groups
- **group_members**: Group membership relationships

### Real-time Features

- Live updates when items are added/modified
- Real-time group activity
- Instant synchronization across devices

## 🎨 Customization

### Theme Colors

Modify CSS custom properties in `src/styles/index.css`:

```css
:root {
  --color-primary: #8b4513;      /* Saddle Brown */
  --color-background: #f5f5dc;   /* Beige */
  --color-text-primary: #2f1b14; /* Dark Brown */
  /* ... more variables */
}
```

### Typography

The application uses two font stacks:

- Primary: `'Courier New', Courier, monospace` (for card-like text)
- Secondary: `'Georgia', serif` (for headings)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Netlify/Vercel

1. Connect your repository to your deployment platform
2. Set environment variables in the platform dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by traditional library card systems
- Built with modern web technologies
- Designed for the mobile-first generation

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

**Happy tracking!** 📚✨
