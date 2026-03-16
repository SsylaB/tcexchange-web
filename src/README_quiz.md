
**Pour lancer le projet :** 
Commencez par installer [Ollama](https://ollama.com)
Téléchargez le modèle avec `ollama pull llama3`. 
Ensuite, dans un premier terminal, accédez au dossier `src/`, 
installez les dépendances via `pip install fastapi uvicorn ollama` 
lancez le serveur avec `python3 -m uvicorn main:app --reload`. 
Enfin, dans un second terminal à la racine du projet, installez les modules Node avec `npm install`
démarrez l'interface via `npm run dev` 
accédez au site sur `http://localhost:5173`.