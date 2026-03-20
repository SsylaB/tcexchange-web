import { NavLink } from "react-router-dom";
import "../styles/Header.css";

function Header() {
    return (
        <header className="header">
            <div className="header__logo">
                <img src="/logo_full.png" alt="TC'exchange" />
            </div>
            <nav className="header__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
                    Catalogue
                </NavLink>
                <NavLink to="/quiz" className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
                    Quiz
                </NavLink>
                <NavLink to="/chatbot" className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
                    Chatbot
                </NavLink>
                <NavLink to="/compare" className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
                    Compare
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
