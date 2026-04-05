# FinanceFlow - Financial Intelligence Platform

A modern, AI-powered financial management and tracking application built with React, TypeScript, and Tailwind CSS. This Progressive Web App (PWA) provides comprehensive financial insights, transaction management, and intelligent analytics.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time financial overview with balance trends and spending breakdowns
- **Transaction Management**: Add, edit, and categorize income/expense transactions
- **AI-Powered Insights**: Smart financial analysis and recommendations
- **Advanced Analytics**: Interactive charts and visualizations using Recharts
- **Data Export/Import**: CSV and JSON export capabilities
- **Role-Based Access**: Admin and Viewer modes for different permission levels

### Technical Features
- **Progressive Web App**: Installable offline-capable application
- **Dark Mode**: Automatic system preference detection with manual toggle
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **State Management**: Zustand with persistent storage
- **Lazy Loading**: Code splitting for optimal performance
- **Micro-interactions**: Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4.2.2** - Utility-first CSS framework

### State & Data
- **Zustand 5.0.12** - Lightweight state management
- **date-fns 4.1.0** - Date manipulation utilities
- **Recharts 3.8.1** - Chart library for data visualization

### UI/UX
- **Lucide React 1.7.0** - Beautiful icon library
- **clsx 2.1.1** - Conditional class utility
- **tailwind-merge 3.5.0** - Tailwind class merging

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI-powered insights components
│   ├── analytics/      # Analytics and charts
│   ├── budgeting/      # Budget management
│   ├── cards/          # Summary cards
│   ├── charts/         # Chart components
│   ├── common/         # Common UI elements
│   ├── transactions/   # Transaction-related components
│   └── ui/             # UI utilities
├── data/               # Mock data and constants
├── features/           # Feature-specific modules
│   └── finance/        # Finance API and types
├── pages/              # Main application pages
├── services/           # External service integrations
├── store/              # State management
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zorvyn-assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 PWA Features

This application is a Progressive Web App with the following capabilities:

- **Offline Support**: Works without internet connection
- **Installable**: Can be installed on desktop and mobile devices
- **App Shortcuts**: Quick access to key features
- **Share Target**: Handle shared content from other apps
- **Responsive Design**: Adapts to different screen sizes

## 🎨 UI Components

### Dashboard
- Financial summary cards with balance, income, and expenses
- Interactive balance trend charts (30-day view)
- Category-based spending breakdown
- Recent transactions activity feed

### Transaction Management
- Full CRUD operations for transactions
- Advanced filtering and search capabilities
- Grouping by category, month, or week
- Bulk data import/export functionality

### Analytics & Insights
- AI-powered financial recommendations
- Spending pattern analysis
- Month-over-month comparisons
- Category-wise expense tracking

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=FinanceFlow
```

### Build Configuration
The application uses optimized Vite configuration with:
- Code splitting for better caching
- Terser minification
- Source maps for debugging
- Chunk size warnings

## 📊 Data Management

### Transaction Categories
Pre-configured categories include:
- **Income**: Salary, Freelance
- **Expenses**: Rent, Groceries, Dining, Transport, Shopping, Entertainment, Utilities, Subscription, Healthcare, Education, Other

### Data Persistence
- Local storage for offline functionality
- Zustand persist middleware for state management
- Export capabilities for data backup

## 🎯 Performance Features

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching Strategy**: Efficient data caching
- **Optimized Build**: Production-ready optimizations

## 🔒 Security Considerations

- Input validation for transaction data
- Sanitized data exports
- Secure API communication patterns
- Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build output in `dist/` can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 📞 Support

For questions or support, please open an issue in the repository.

---

**FinanceFlow** - Your intelligent financial companion for modern money management.