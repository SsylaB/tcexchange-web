import { Outlet } from "react-router-dom";
import "../styles/Layout.css";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";
import Chatbot from "./Chatbot";

function Layout() {
    return (
        <div className="layout-wrapper">
            <Header />
            
            <main className="layout__content">
                <Outlet /> {/* ← chaque page s'affiche ici */}
            </main>

            <footer className="layout__footer">
                <div className="footer-container">
                    <div className="footer-logo">
                        <img src="/logo-insa.png" alt="Logo INSA" className="footer-logo-img" />
                    </div>
                    
                    <p className="footer-project">Projet WEB — INSA Lyon 3TC</p>
                    
                    <div className="footer-info">
                        <p className="footer-credits">
                            Réalisé par <b>Abderrazik Aida</b> - <b>Boubaker Lilia</b> - <b>Boulifa Khadija</b> - <b>Chkoundali Haifa</b> - <b>Sfar Anas</b>
                        </p>
                        <span className="footer-date">© 2026</span>
                    </div>
                </div>
            </footer>

            <ScrollToTop />
<<<<<<< HEAD
            <Chatbot />
        </>
=======
        </div>
>>>>>>> fbe1a60 (Redesign Home page and login page)
    );
}

export default Layout;