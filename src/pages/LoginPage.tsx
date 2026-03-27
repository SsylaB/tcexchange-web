import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css"; 

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.ChangeEvent) => {
        e.preventDefault();
<<<<<<< HEAD
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("username", data.username);
            navigate("/");
=======
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("username", data.username);
                navigate("/");
            } else {
                setError("Utilisateur non reconnu ou erreur serveur.");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
        } finally {
            setIsLoading(false);
>>>>>>> fbe1a60 (Redesign Home page and login page)
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                <div className="login-header">
                    <div className="login-site-logo-wrapper">
                        <img 
                            src="/logo_full.png" 
                            alt="TC Exchange Logo" 
                            className="login-logo-img-tc" 
                        />

                        <img 
                            src="/logo-insa-rouge.png" 
                            alt="Logo INSA Lyon" 
                            className="login-logo-img-insa" 
                        />
                    </div>
                    
                    <p>Connecte-toi avec ton identifiant INSA</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Login INSA</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="ex: jdupont"
                            required
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    );
}