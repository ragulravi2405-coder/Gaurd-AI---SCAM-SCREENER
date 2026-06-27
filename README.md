# Consumer Rights & Scam Screener

A web application that helps users identify potential scams and understand consumer rights. Users can analyze suspicious messages, emails, websites, or offers using AI-powered insights and receive guidance on possible risks and recommended actions.

## Features

- 🔍 Scam detection and analysis
- 🤖 AI-powered risk assessment
- 📋 Consumer rights guidance
- ⚡ Fast and responsive interface
- 📱 Mobile-friendly design

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini API

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/consumer-rights-scam-screener.git
```

2. Navigate to the project directory

```bash
cd consumer-rights-scam-screener
```

3. Install dependencies

```bash
npm install
```

4. Create a `.env.local` file in the project root and add your API key

```env
GEMINI_API_KEY=your_api_key_here
```

5. Start the development server

```bash
npm run dev
```

6. Open your browser and visit

```
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
├── pages/
├── services/
├── utils/
├── assets/
└── App.tsx
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| GEMINI_API_KEY | Google Gemini API Key |

## License

This project is developed for educational and internship assessment purposes.
