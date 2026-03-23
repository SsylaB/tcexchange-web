import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CatalogPage from "./pages/CatalogPage";
import QuizPage from "./pages/QuizPage";
import ChatbotPage from "./pages/ChatbotPage";
import DestinationPage from "./pages/DestinationPage";
import ComparePage from "./pages/ComparePage";
import MapPage from "./pages/MapPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path={"/map"} element={<MapPage />} />
                    <Route path={"/compare"} element={<ComparePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
