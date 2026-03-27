import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const ChatbotPage = lazy(() => import("./pages/ChatbotPage"));
const DestinationPage = lazy(() => import("./pages/DestinationPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const MapPage = lazy(() => import("./pages/MapPage"));

function App() {
    if (!localStorage.getItem("username")) {
        localStorage.setItem("username", "guest");
    }
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Chargement...</div>}>
                <Routes>
                    <Route path="/login" element={<Navigate to="/" />} />
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
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
