# MEnglish

A modern vocabulary learning platform powered by spaced repetition and AI-assisted word extraction.

## Features

### Smart Learning
- **Spaced Repetition Algorithm** - Optimizes review timing based on memory science
- **Memory Score Tracking** - Visual progress for every word (0-100%)
- **Set-Based Reviews** - Practice entire vocabulary sets for comprehensive learning

### Multiple Learning Modes
- **Flashcards** - Swipeable cards with flip animations
- **Multiple Choice** - Quiz yourself with auto-generated options
- **Write the Word** - Active recall with typo tolerance
- **Matching Game** - Interactive tile-matching across multiple rounds
- **Test Mode** - Mixed question types for comprehensive assessment

### Vocabulary Management
- **Folder Organization** - Group sets by topic or level
- **Manual Entry** - Add words with definitions and examples
- **CSV/TSV Import** - Bulk import with column mapping
- **AI Essay Import** - Paste text and extract vocabulary automatically

### Progress Dashboard
- **Stats Overview** - Total words, streaks, memory scores
- **Activity Calendar** - GitHub-style heatmap of learning activity
- **Review Calendar** - See upcoming reviews color-coded by workload
- **Recent Activity** - Track your learning sessions

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- OpenRouter API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/kvgkvg/MEnglish.git
cd MEnglish

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **AI**: DeepSeek via OpenRouter
- **Deployment**: Vercel

## License

Private project - All rights reserved
