import "./styles/App.css";

import AIBotSection from "./pages/chatbot/chatbot";
import Login from "./pages/login/login";

import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {

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
