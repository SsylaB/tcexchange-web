import { Outlet } from "react-router-dom";
import "../styles/Layout.css";
import Header from "./Header";
import Chatbot from "./Chatbot";

function Layout() {
    return (
        <>
            <Header />
            <div className="layout__content">
                <Outlet />
            </div>
            <Chatbot />
        </>
    );
}

export default Layout;