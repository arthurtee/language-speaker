# Language Speaker

An interactive web application for practicing speaking local languages (Singaporean English, Malay, Japanese, Korean) by identifying professions through voice recognition.

## 🎯 Description

Language Speaker is a fun and engaging language learning app that helps users practice speaking different languages by identifying professions. The app uses AI-powered speech recognition to verify pronunciation and provides encouraging voice feedback to create an enjoyable learning experience.

### Features

- 🌏 **Multi-language Support**: Practice English, Malay, Japanese, and Korean
- 🎤 **AI Speech Recognition**: Powered by Whisper (Transformers.js) for accurate transcription
- 🔊 **Natural Voice Feedback**: High-quality TTS using SpeechT5 model
- 🎨 **Modern UI**: Beautiful glassmorphism design with smooth animations
- 💡 **Help System**: Reveal answers when needed

## Repository Structure

-   **[frontend/](./frontend/)**: Next.js + React frontend application.
-   **[backend/](./backend/)**: Python FastAPI backend service.
-   **[infra/](./infra/)**: Infrastructure and deployment configurations.

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd language-speaker
```

### 2. Start the Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 main.py
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

## 🎮 How to Use

1. **Select a Country** - Choose which language you want to practice
2. **View the Profession** - An image of a profession will appear
3. **Speak the Answer** - Click the microphone and say the profession name in the selected language
4. **Get Feedback** - Receive instant voice and text feedback
5. **Continue Learning** - Move to the next profession automatically or use the Skip button