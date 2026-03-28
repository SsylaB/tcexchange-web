export async function findBestAnswer(
    userMessage: string,
    conversationHistory?: { role: string; content: string }[],
): Promise<string> {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory || [],
            }),
        });

        if (!response.ok) {
            return "Erreur API: " + response.status;
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Chat API error:", error);
        return "Désolé, le backend n'est pas accessible. Vérifie que le serveur Rust tourne sur le port 3000 !";
    }
}
