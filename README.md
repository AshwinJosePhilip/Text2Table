# Text2Table API

Convert natural language to SQL and MongoDB queries using Google's Generative AI.

## 🚀 Features

- Natural language to SQL query conversion
- Natural language to MongoDB query conversion
- Built with Express.js and Google's Generative AI
- Simple REST API endpoints

## 📋 Prerequisites

- Node.js 14+
- Google Cloud API key
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/text2table.git
cd text2table
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend directory:
```env
PORT=5000
GOOGLE_API_KEY=your_google_api_key
```

## 🔧 API Endpoints

### GET /
Health check endpoint

### POST /api/convert
Convert text to SQL or MongoDB query

**Request Body:**
```json
{
  "text": "find all users who registered in last 30 days",
  "format": "sql" // or "mongodb"
}
```

## 🚀 Usage

Start the server:
```bash
npm start
```

## 📝 License

MIT © [Your Name]
