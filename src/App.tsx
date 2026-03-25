import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
    const user = localStorage.getItem("username");
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={user ? <Layout /> : <Navigate to="/login" />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/map" element={<MapPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
