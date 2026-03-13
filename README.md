# AI Presentation Generator ✨ (-__-)

A sophisticated, full-stack web application that leverages Local AI (Ollama) and Firebase to generate high-quality, professional presentations from simple text prompts.

## 🌟 Key Features

- **Local AI Integration**: Uses Ollama (Llama3/Mistral) for streaming generation of slide outlines and content.
- **Image-Free Premium Design**: Focused on typography and layout hierarchy to create clean, professional presentations without visual clutter.
- **Editable PPTX Export**: Seamlessly export your AI-generated sliders to fully editable PowerPoint files using `PptxGenJS`.
- **Credit-Based System**: Integrated Firestore transactions to manage user credits securely.
- **Interactive Editor**: Real-time slide preview with an interactive sidebar for quick content refinement.
- **Authentication**: Secured by Clerk Auth.
- **Hinglish Development**: Core project logic is documented in Hinglish (Hindi + English) for a personalized and clear developer experience.

## 🛠️ Tech Stack

- **Frontend**: React.ts, Vite, Tailwind CSS
- **Authentication**: Clerk
- **Backend/Database**: Firebase Firestore
- **AI Engine**: Ollama (Running locally)
- **Styling**: Shadcn UI (Custom Optimized)
- **Export Engine**: PptxGenJS
- **Icons**: Lucide React

##  Getting Started

### Prerequisites

1.  **Node.js**: Ensure you have Node 18+ installed.
2.  **Ollama**: Install [Ollama](https://ollama.com/) and pull a model (e.g., `llama3`).
    ```bash
    ollama run llama3
    ```
3.  **Firebase Settings**: Set up a Firebase project and add your config to `src/config/firebase.ts`.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/ai-ppt-generator.git
    cd ai-ppt-generator
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Environment Variables:
    Create a `.env` file and add your Clerk and Firebase keys:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    VITE_FIREBASE_API_KEY=...
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

##  Project Logic 

Humne project ki core logic ko Hinglish me document kiya hai taaki development aur debugging fast ho sake. 
- `OutlinePage.tsx`: AI streaming aur content extraction logic.
- `EditorPage.tsx`: Slide transformation aur premium styling.
- `pptxGenerator.ts`: Native PowerPoint mapping rules.

## 🔮 Future Additions

- **Advanced Templates**: Adding support for charts, diagrams, and data-driven slides.
- **AI Image Generation**: Re-integrating smart image generation (e.g., DALL-E or Pollinations) with automated layout balancing.
- **Multi-Language Support**: Expanding beyond English/Hinglish to support global languages.
- **Collaborative Editing**: Real-time multi-user editing powered by Firebase.
- **AI Speaker Notes**: Automating the creation of speaker scripts for every slide.
- **Theme Marketplace**: Allowing users to create and share custom design styles.
- **Audio Integration**: Adding voiceovers and background music to exports.

## Author

Developed with ❤️ by Rohit.
