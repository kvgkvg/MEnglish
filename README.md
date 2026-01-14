# MEnglish - English Vocabulary Learning Platform

A modern vocabulary learning platform with spaced repetition, multiple learning modes, and intelligent word extraction.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **External APIs**: DeepSeek (via OpenRouter)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [Supabase](https://supabase.com/dashboard)
2. Go to Project Settings > API
3. Copy your project URL and anon/public key
4. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=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
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Status

### ✅ Period 1: Project Foundation (COMPLETED)
- Next.js 15 project initialized with TypeScript
- Tailwind CSS configured with custom theme
- Supabase authentication setup (signup, login, logout)
- Protected route middleware
- Basic dashboard layout with navigation
- Auth pages (login, signup) with modern UI

### ✅ Period 2: Dashboard with Progress Tracking (COMPLETED)
- Database schema created (7 tables with RLS policies)
- Stats cards component (Total Words, Streak, Memory Score, Words Mastered)
- Progress chart with dual-line visualization (Words & Memory Score)
- Activity streak calendar (GitHub-style heatmap)
- Recent activity feed
- Mock data for visualization
- Quick action buttons

### ✅ Period 3: Vocab Set Management (COMPLETED)
- Server actions for folders (create, read, update, delete)
- Server actions for vocab sets (CRUD operations)
- SetCard component with progress bars and dropdown menu
- CreateSetDialog for creating new sets
- CreateFolderDialog for creating folders
- MoveSetDialog to move sets between folders
- Collapsible folder sections
- Empty states and loading states
- Real database integration (no more mock data!)

### ✅ Period 4: Manual Vocab Creation (COMPLETED)
- Server actions for vocab words (add, update, delete, get)
- WordForm component for individual word input
- AddWordsDialog with dynamic form array (add/remove words)
- WordCard component for displaying words with edit/delete actions
- Set detail page showing all words in a set
- Empty state with helpful guidance
- Beautiful word cards with definitions and example sentences

### ✅ Period 5: CSV/TSV Import (COMPLETED)
- ImportCSVDialog component with 3-step wizard
- Dual input methods: file upload OR paste text
- File upload with drag-and-drop support
- CSV/TSV parsing using papaparse library
- Intelligent column auto-detection
- Column mapping interface
- Preview before import with first 10 words
- Bulk import validation

### ✅ Period 6: AI Essay Import (COMPLETED)
- Modular AI service architecture for easy model swapping
- DeepSeek integration via OpenRouter API
- ImportEssayDialog component with 2-step wizard
- Paste essay text for automatic vocabulary extraction
- AI extracts ALMOST ALL non-basic vocabulary to maximize learning
- Filters out words user already knows
- Review and select words before importing
- Word selection interface with checkboxes
- Extensible design for adding custom models in the future

### ✅ Period 7: Flashcard Learning Mode (COMPLETED)
- Swipeable flashcard component with smooth animations
- Card flip animation on tap (front: word, back: definition + example)
- Swipe gestures for quick review (left = still learning, right = I know)
- Alternative button controls for non-touch devices
- Drag-based card interaction using framer-motion
- Real-time statistics tracking (know/learning/remaining)
- Progress bar showing completion
- Comprehensive session summary with performance feedback
- List of words needing more review
- Quick actions: Study Again or Test Yourself
- Word randomization for varied practice
- Beautiful gradient UI with 3D perspective effects

### ✅ Period 8: Multiple Choice Learning Mode (COMPLETED)
- Learning mode selection page with 5 different modes
- Multiple Choice quiz component with 4-option questions
- Automatic distractor generation (wrong answer options)
- Question randomization for varied practice
- Real-time answer validation with visual feedback
- Progress tracking bar
- Comprehensive results screen with score percentage
- Review incorrect answers with explanations
- Example sentences shown after answering
- Retry and mode switching functionality
- Minimum 4 words required to start quiz
- Beautiful gradient UI with smooth animations

### ✅ Period 9: Write the Word Mode (COMPLETED)
- Typing interface for active recall practice
- Fuzzy matching algorithm using Levenshtein distance
- Typo tolerance (85%+ similarity accepted as correct)
- Real-time answer validation with detailed feedback
- Three feedback types: exact match, close match, wrong
- Similarity percentage display for incorrect answers
- Example sentences shown after answering
- Progress tracking bar
- Comprehensive results screen with performance feedback
- Review section showing all incorrect answers
- Spelling practice optimized for vocabulary retention
- Auto-focus on input field for smooth flow
- Double Enter key navigation (submit then continue)
- Purple/pink gradient theme matching writing mode

### ✅ Period 10: Matching Grid Game (COMPLETED)
- Interactive tile-based matching interface
- 6 word pairs (12 tiles) per round
- **Continuous gameplay**: Automatically loads next 6 words after completing each round
- **Multi-round support**: Plays through ALL words in the set
- Round progress tracking (e.g., "Round 2 of 3")
- Color-coded tiles (orange for words, yellow for definitions)
- Click two tiles to match word with definition
- Smooth animations using framer-motion
- Visual feedback for selections and matches
- Matched pairs fade out with checkmark overlay
- Real-time timer tracking total game duration
- Attempt counter for each round and cumulative total
- Round completion celebration between batches
- Automatic completion detection
- Final screen with cumulative stats across all rounds
- Performance feedback based on total attempts
- Play again with reshuffled tiles
- Minimum 6 words required to play
- Orange/yellow gradient theme

### ✅ Period 11: Test Mode (COMPLETED)
- Mixed question types for comprehensive testing
- Four question formats:
  - True/False questions (correct/incorrect definition validation)
  - Multiple Choice questions (4 options per question)
  - Write questions (type the word from definition)
  - Matching mini-games (3 pairs per question)
- Intelligent question distribution (25% T/F, 35% MC, 25% Write, rest Matching)
- Progress tracking through the test (e.g., "Question 5 of 10")
- Immediate feedback for each answer
- Comprehensive results screen with percentage score
- Performance breakdown by question type
- Review section showing all incorrect answers
- Retry test with new question generation
- Minimum 4 words required to take test
- Red/pink gradient theme matching test mode

### ✅ Period 12: Spaced Repetition Algorithm (COMPLETED)
- SM-2 variant algorithm implementation for memory optimization
- Memory score scale (0-100):
  - 85-100: Mastered (review every 7 days)
  - 70-84: Strong (review every 3 days)
  - 50-69: Learning (review every 1 day)
  - 0-49: Needs work (review same day)
- Intelligent score calculation based on performance and difficulty
- Difficulty adjustment by question type (write=hardest, true/false=easiest)
- Response time consideration for score updates
- Automatic next review date calculation
- Progress tracking integrated into all learning modes:
  - Flashcards: Records know/don't know responses
  - Multiple Choice: Tracks answer accuracy
  - Write the Word: Records spelling accuracy
  - Matching Game: Tracks all matches as correct
  - Test Mode: Records performance by question type
- Learning session history with score tracking
- User stats updating (streak tracking, last activity)
- Retention rate calculation (correct/total attempts)
- Mastery level determination with color coding
- Server actions for progress CRUD operations
- Batch progress updates for efficiency

### ✅ Period 13: Memory Score Tracking UI (COMPLETED)
- **WordProgressCard Component**: Beautiful progress display for each word
  - Memory score with color-coded progress bar (green=mastered, blue=strong, yellow=learning, red=needs work)
  - Mastery level badges with visual indicators
  - Next review date display
  - Retention rate percentage (correct/total)
  - Review count statistics
  - "Review Due" indicator for words needing practice
  - "Not studied yet" state for new words
- **Set Detail Page Enhancements**:
  - Overall set memory score with progress bar
  - Mastered word count with percentage
  - Words due for review counter
  - View mode toggle: "All Words" vs "Due for Review"
  - Empty state for "all caught up" when no reviews due
  - Grid display of all words with individual progress cards
- **Learning Mode Selection Improvements**:
  - Comprehensive progress stats card:
    - Memory score gauge (0-100%)
    - Mastered words count and percentage
    - Due for review counter with urgency indicator
    - Motivational messages based on progress
  - Quick stats summary bar
  - Visual feedback for retention levels
- **Set-Level Statistics**:
  - Automatic calculation of average memory score across all words
  - Percentage of words mastered (85%+ memory score)
  - Count of words needing review (past due date)
- **Color-Coded Progress System**:
  - Green (85-100%): Mastered - review every 7 days
  - Blue (70-84%): Strong - review every 3 days
  - Yellow (50-69%): Learning - review every 1 day
  - Red (0-49%): Needs Work - review same day
- Full integration with existing spaced repetition backend

### ✅ Enhanced: Set-Based Review System & Calendar (COMPLETED)
- **Set-Based Review Philosophy**:
  - **Review ENTIRE SETS, not individual words**
  - When a set is due for review, learners practice ALL words in that set
  - If most words are mastered, reviews will be naturally quick (correct answers)
  - Maintains comprehensive practice while letting performance determine duration
  - Set review date based on earliest word needing review in the set
- **Learn Tab (Main Dashboard) Improvements**:
  - Mastery percentage displayed on each set card
  - Memory score with color-coded progress bar
  - Real-time word count and mastered count
  - "Review Now" vs "Study" button based on set's due status
  - Progress bar colored by retention level (green/blue/yellow/red)
- **Review Notification System**:
  - Animated "Review Due" badge on sets needing review
  - Orange pulsing badge (not word count - just notification)
  - Automatic tracking from first learning session
  - Shows which SETS are due, not individual words
- **Review Calendar Feature**:
  - Interactive monthly calendar view with navigation
  - **Color-coded dates based on number of SETS to review**:
    - Green (1 set): Light review day
    - Yellow (2 sets): Moderate review day
    - Orange (3-4 sets): Heavy review day
    - Red (5+ sets): Very heavy review day
  - Click on any date to see which sets need review
  - Set count badge on each date (e.g., "2 sets")
  - Today indicator with blue dot
  - Set-specific review details on date selection:
    - Set name with quick link to start learning
    - Total words in each set
    - Direct navigation to learning modes
  - Toggle calendar visibility with button
  - Visual legend explaining color coding
  - Past dates shown with reduced opacity
  - Empty state message for date selection
- **Smart Review Scheduling (Set-Level)**:
  - Notifications appear automatically based on spaced repetition algorithm
  - Set marked "due" when ANY word in it needs review
  - Review dates calculated after every learning session
  - Sets scheduled based on their lowest-performing words
  - Calendar automatically updates after each learning session
  - Always practice full vocabulary set, regardless of individual word status
- **Visual Priority System**:
  - Sets needing review highlighted with orange badge
  - "Review Due" indicator on set cards
  - "Review Now" call-to-action on cards needing practice
  - Calendar provides bird's-eye view of set review schedule

### 🔜 Next Steps
- Period 14: UI/UX polish and animations
- Period 15: Vercel deployment

## Development Workflow

The project is being built in 16 periods. See `IMPLEMENTATION_PLAN.txt` for the complete roadmap.

## Features (Planned)

- 📊 Dashboard with progress tracking
- 📚 Vocabulary set management with folders
- ➕ Multiple import methods (manual, CSV/TSV, AI essay extraction)
- 🎴 Flashcard learning mode
- ✅ Multiple choice quizzes
- ✏️ Write-the-word exercises
- 🎮 Matching grid game
- 📝 Comprehensive tests
- 🧠 Spaced repetition algorithm
- 📈 Memory score tracking

## License

Private project - All rights reserved
