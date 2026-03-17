import { Outlet } from "react-router-dom";
import "../styles/Layout.css";
import Header from "./Header";

function Layout() {
    return (
        <>
            <Header />
            <div className="layout__content">
                <Outlet /> {/* ← chaque page s'affiche ici */}
            </div>
        </>
    );
}

export default Layout;
