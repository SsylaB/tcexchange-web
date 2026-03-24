import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("username", data.username);
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>TCExchange</h1>
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ton login INSA (ex: jdupont)"
            />
            <button type="submit">Se connecter</button>
        </form>
    );
}