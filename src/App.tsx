<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage.tsx";
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
import CatalogPage from "./pages/CatalogPage";
import QuizPage from "./pages/QuizPage";
import ChatbotPage from "./pages/ChatbotPage";
import DestinationPage from "./pages/DestinationPage";
<<<<<<< HEAD

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
=======
import ComparePage from "./pages/ComparePage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";

function App() {
    const user = localStorage.getItem("username");
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={user ? <Layout /> : <Navigate to="/" />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/destination/:id" element={<DestinationPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/map" element={<MapPage />} />
>>>>>>> f71d69531026042264f2f0b33938708b39cb0a4c
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
