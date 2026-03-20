import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CatalogPage from "./pages/CatalogPage";
import QuizPage from "./pages/QuizPage";
import ChatbotPage from "./pages/ChatbotPage";
import DestinationPage from "./pages/DestinationPage";
import { FavoritesProvider } from "./context/FavoritesContext";
import ComparePage from "./pages/ComparePage";

function App() {
    return (
        <FavoritesProvider>
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
        </FavoritesProvider>
    );
}

export default App;
