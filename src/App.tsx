import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage.tsx";
import CatalogPage from "./pages/CatalogPage";
import QuizPage from "./pages/QuizPage";
import ChatbotPage from "./pages/ChatbotPage";
import DestinationPage from "./pages/DestinationPage";
import ComparePage from "./pages/ComparePage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* On garde la route login au cas où tu en as besoin plus tard */}
                <Route path="/login" element={<LoginPage />} />

                {/* Toutes les autres routes sont maintenant accessibles directement via le Layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/map" element={<MapPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
