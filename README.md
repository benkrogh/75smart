# 75 SMART Challenge Tracker

An interactive React web application for tracking your 75-day fitness journey with **Sustainable Momentum And Real Transformation**.

## Features

### 📝 Daily Input Tracking
- **Weight tracking** with daily measurements
- **Calorie consumption** tracking (2000 calorie target)
- **Running data** including:
  - Time (minimum 20 minutes)
  - Distance
  - Calories burned
  - Average pace per mile
  - Elevation gain
  - Average heart rate
- **Additional workout** tracking:
  - Strength training or recovery sessions
  - Length (minimum 20 minutes)
  - Calories burned
  - Average heart rate

### 📊 Interactive Dashboard
- **Progress overview** with key statistics
- **Weight progress** line chart over 75 days
- **Calorie intake** tracking vs 2000 target
- **Running performance** visualization
- **Workout type distribution** pie chart
- **Recent activity** timeline

### 🔗 Sharing Capability
- Shareable dashboard link without input UI
- Perfect for sharing progress with friends/trainers

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **ShadCN UI** components for beautiful, accessible interface
- **Tailwind CSS** for responsive styling with custom CSS variables
- **Recharts** for data visualization
- **Lucide React** for icons
- **Local Storage** for data persistence
- **Radix UI** primitives for accessible components
- **Date-fns** for date handling
- **Class Variance Authority** for component variants

## ShadCN UI Components

The project uses ShadCN UI with the following configuration:

### Configuration (`components.json`)
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Installed Components
Located in `src/components/ui/`:

- **Badge** (`badge.tsx`) - Status indicators and labels
- **Button** (`button.tsx`) - Primary interaction buttons with variants
- **Calendar** (`calendar.tsx`) - Date selection calendar
- **Card** (`card.tsx`) - Content containers with header/content structure
- **DatePicker** (`date-picker.tsx`) - Date input with popover calendar
- **Input** (`input.tsx`) - Form input fields
- **Label** (`label.tsx`) - Form field labels
- **Popover** (`popover.tsx`) - Floating content containers
- **Progress** (`progress.tsx`) - Progress bars and indicators
- **Select** (`select.tsx`) - Dropdown select menus
- **Separator** (`separator.tsx`) - Visual dividers
- **Tabs** (`tabs.tsx`) - Tabbed navigation interface

### Component Usage Pattern
```tsx
// Example: Using Card and Button components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Components follow ShadCN conventions with CSS variables for theming
```

## Project Architecture

### Directory Structure
```
/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                 # ShadCN UI components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tabs.tsx
│   │   ├── App.tsx             # Secondary app wrapper (unused)
│   │   ├── DailyInput.tsx      # Daily entry form component
│   │   ├── Dashboard.tsx       # Progress visualization component
│   │   └── HistoryView.tsx     # Historical data view component
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, date helpers)
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── index.css               # Global styles and ShadCN variables
│   └── main.tsx                # Application entry point
├── components.json             # ShadCN CLI configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite bundler configuration
└── package.json                # Dependencies and scripts
```

### Data Models

The application uses strongly typed interfaces defined in `src/types/index.ts`:

```typescript
interface DailyEntry {
  date: string;           // ISO date string
  weight: number;
  calories: number;
  run: RunData;
  additionalWorkout: AdditionalWorkoutData;
}

interface RunData {
  time: number;           // in seconds
  distance: number;       // in miles
  calories: number;
  avgPacePerMile: string; // "MM:SS" format
  elevationGain: number;  // in feet
  avgHeartRate: number;   // bpm
}

interface AdditionalWorkoutData {
  type: 'strength' | 'recovery';
  length: number;         // in minutes
  calories: number;
  avgHeartRate: number;   // bpm
}

interface ChallengeData {
  startDate: string;      // ISO date string
  entries: Record<string, DailyEntry>; // key is date string
  targetCalories: number; // default 2000
}
```

### Configuration Details

#### Vite Configuration
- **Path Aliases**: `@/*` maps to `src/*`
- **React Plugin**: Hot reload and JSX transform
- **TypeScript**: Full TypeScript support with strict mode

#### Tailwind CSS Setup
- **CSS Variables**: Uses HSL color space for theming
- **ShadCN Integration**: Custom CSS properties for light/dark themes
- **Component Classes**: Pre-configured utility classes for ShadCN components

#### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Path Mapping**: `@/*` alias for clean imports
- **JSX**: React JSX transform

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit `http://localhost:5173`

### Building for Production

```bash
npm run build      # TypeScript compilation + Vite build
npm run preview    # Preview production build locally
```

### Adding New ShadCN Components

To add additional ShadCN components:

```bash
npx shadcn-ui@latest add [component-name]
```

This will:
- Add the component to `src/components/ui/`
- Install required dependencies
- Update imports automatically

## Usage

### Daily Entry
1. Navigate to the **Daily Input** tab
2. Fill out your daily metrics:
   - Date, weight, and calories consumed
   - Running session details
   - Additional workout information
3. Click **Save Daily Entry**

### Viewing Progress
1. Switch to the **Dashboard** tab
2. View your progress charts and statistics
3. Track your journey over the 75-day challenge

### Viewing History
1. Navigate to the **History** tab
2. Browse all previous entries
3. Filter and search historical data
4. Edit or delete past entries

### Sharing Your Progress
1. Click the **Share Dashboard** button
2. Copy the generated link
3. Share with friends - they'll see your dashboard without editing access

## The 75 SMART Challenge

### Core Principles
- **40 minutes of intentional movement, 7 days per week**
- **20 minutes minimum cardio every single day**
- **20 minutes additional work (weights or extended cardio)**
- **2,000 calorie daily tracking**
- **Progressive overload in all areas**

### Success Rules
1. **Something is better than nothing** - 10 minutes beats zero
2. **Form over everything** - Quality over quantity
3. **Track honestly** - Accurate data leads to real results
4. **Progress photos and measurements** - Take them every 2 weeks

## Data Storage

All data is stored in `localStorage` using the key `75-smart-challenge-data`. The data structure follows the `ChallengeData` interface with entries indexed by date strings.

### Data Persistence
- **Auto-save**: All entries automatically saved to localStorage
- **Data Format**: JSON serialized `ChallengeData` object
- **Backup**: Export functionality available through shareable URLs

## Development

### Key Dependencies

**Runtime Dependencies:**
- `react` & `react-dom`: React framework
- `@radix-ui/*`: Headless UI primitives for ShadCN
- `class-variance-authority`: Component variant management
- `clsx` & `tailwind-merge`: Conditional CSS class handling
- `lucide-react`: Icon library
- `recharts`: Chart visualization library
- `date-fns`: Date manipulation utilities
- `react-day-picker`: Calendar component

**Development Dependencies:**
- `vite`: Fast build tool and dev server
- `typescript`: Type checking and compilation
- `tailwindcss`: Utility-first CSS framework
- `eslint`: Code linting and formatting
- `@vitejs/plugin-react`: React support for Vite

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - TypeScript compilation + production build
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Code Style and Conventions
- **TypeScript**: Strict mode enabled, explicit typing required
- **Components**: Functional components with TypeScript interfaces
- **Styling**: Tailwind CSS classes, ShadCN component variants
- **State Management**: React hooks (useState, useEffect) with localStorage
- **File Naming**: PascalCase for components, camelCase for utilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns:
   - Use existing ShadCN components when possible
   - Follow TypeScript strict mode requirements
   - Maintain data model consistency
   - Update type definitions as needed
4. Test thoroughly (all tabs, data persistence, sharing)
5. Submit a pull request

## License

MIT License - See LICENSE file for details

---

*Your future self is counting on the decisions you make today. Make them proud.*