import "./styles/App.css";
import { useEffect } from "react";

import AIBotSection from "./pages/chatbot/chatbot";
import Login from "./pages/login/login";

import { initializeAIStreamListener } from "./api/api_service";
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
    useEffect(() => {
        // Initialize IPC stream listener once on mount
        initializeAIStreamListener();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login></Login>}></Route>
                <Route path="/chatbot" element={<AIBotSection></AIBotSection>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
