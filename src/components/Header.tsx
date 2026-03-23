import { NavLink } from "react-router-dom";
import "../styles/Header.css";

function Header() {
    return (
        <header className="header">
            <div className="header__logo">
                <NavLink to="/">
                    <img src="/logo_full.png" alt="TC'exchange"/>
                </NavLink>
            </div>
            <nav className="header__nav">
                <NavLink to="/catalog" end
                         className={({ isActive }) =>
                             `nav-link nav-link--catalog${isActive ? " nav-link--active" : ""}`}>
                    Catalogue
                </NavLink>
                <NavLink to="/map"
                         className={({ isActive }) =>
                             `nav-link nav-link--map${isActive ? " nav-link--active" : ""}`}>
                    Carte
                </NavLink>
                <NavLink to="/quiz"
                         className={({ isActive }) =>
                             `nav-link nav-link--quiz${isActive ? " nav-link--active" : ""}`}>
                    Quiz
                </NavLink>
                <NavLink to="/chatbot"
                         className={({ isActive }) =>
                             `nav-link nav-link--chatbot${isActive ? " nav-link--active" : ""}`}>
                    Chatbot
                </NavLink>
                <NavLink to="/compare"
                         className={({ isActive }) =>
                             `nav-link nav-link--compare${isActive ? " nav-link--active" : ""}`}>
                    Comparer
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
