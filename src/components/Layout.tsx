import { Outlet } from "react-router-dom";
import "../styles/Layout.css";
import Header from "./Header";
import Chatbot from "./Chatbot";

function Layout() {
    return (
        <>
            <Header />
            <div className="layout__content">
                <Outlet /> {/* ← chaque page s'affiche ici */}
            </div>
            {/* Le Chatbot est ajouté ici pour être visible sur tout le site */}
            <Chatbot /> 
        </>
    );
}

export default Layout;