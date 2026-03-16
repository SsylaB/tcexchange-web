from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ollama

app = FastAPI()

# Configuration CORS pour autoriser React (Vite) à parler au Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En développement, on autorise tout
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend")
async def recommend(answers: dict):
    try:
        # On prépare un résumé des réponses pour l'IA
        profil = (
            f"Nationalité: {answers.get('nationalite')}, "
            f"Année: {answers.get('annee')}, "
            f"Moyenne: {answers.get('moyenne')}, "
            f"Continent: {answers.get('continent')}, "
            f"Budget: {answers.get('budget')}, "
            f"Domaine: {answers.get('domaine')}."
        )
        
        # Appel à Ollama (assure-toi d'avoir fait 'ollama pull llama3')
        response = ollama.chat(model='llama3', messages=[
            {
                'role': 'system',
                'content': 'Tu es un conseiller en mobilité internationale. Propose 3 universités précises basées sur le profil.'
            },
            {
                'role': 'user',
                'content': f"Voici mon profil d'étudiant : {profil}. Quelles destinations me conseilles-tu ?"
            },
        ])
        
        return {"result": response['message']['content']}
    except Exception as e:
        return {"result": f"Erreur avec Ollama : {str(e)}"}

# Lancer avec : uvicorn main:app --reload