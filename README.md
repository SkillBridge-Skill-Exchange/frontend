# SkillBridge Frontend 🎨

The student-facing React application for the SkillBridge platform. Facilitates skill discovery, profile management, and real-time collaboration.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **NPM** or **Yarn**

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/SkillBridge-Skill-Exchange/frontend.git
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure Environment**:
Create a `.env` file in the root directory (optional if using defaults):
```env
REACT_APP_API_URL=http://localhost:5000
```

4. **Start the development server**:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## 💬 Core Features

### 1. Real-time Messaging
- Fully integrated chat system with **Socket.io**.
- Support for text, images, videos, and files.
- **Voice Messaging**: Record and send audio messages directly within the chat.
- **Group Chats**: Create and manage groups with administrative controls.

### 2. Skill Matching
- Discover students with complementary skills.
- AI-powered recommendations based on your "Offers" and "Requests".

### 3. Profile & Portfolio
- Display your skills, endorsements, and project portfolio.
- Track your requests and match history.

### 4. Interactive UI
- Modern, high-premium design with **Lucide React** icons.
- Responsive layout for mobile and desktop.
- Real-time notifications and typing indicators.

---

## 🛠️ Tech Stack

| Layer          | Technology                |
|----------------|---------------------------|
| Framework       | React.js (v18)            |
| Routing        | React Router Dom          |
| Icons          | Lucide React              |
| Communication  | Axios, Socket.io-client   |
| Styling        | Vanilla CSS               |

---

## 📁 Folder Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application views (Messaging, Profile, Requests, etc.).
- `src/context`: Auth and Socket state management.
- `src/api`: Axios instance and API service definitions.
- `src/assets`: Static images and global styles.

---

## 📝 License

ISC
