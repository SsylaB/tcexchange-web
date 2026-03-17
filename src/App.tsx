import { Routes, Route } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage";
import DestinationPage from "./pages/DestinationPage";
import "./App.css"

function App() {
  return (
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/destination/:id" element={<DestinationPage />} />
      </Routes>
  );
}

export default App;
