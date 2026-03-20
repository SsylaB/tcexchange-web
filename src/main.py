from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os

# FORCE LE NO_PROXY AVANT TOUT
# Cela dit à Python : "N'écoute pas le réseau de l'INSA pour ces adresses"
os.environ['NO_PROXY'] = '127.0.0.1,localhost'
os.environ['no_proxy'] = '127.0.0.1,localhost'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend")
async def recommend(answers: dict):
    try:
        profil = (
            f"Nationalité: {answers.get('nationalite')}, "
            f"Année: {answers.get('annee')}, "
            f"Moyenne: {answers.get('moyenne')}, "
            f"Continent: {answers.get('continent')}, "
            f"Budget: {answers.get('budget')}, "
            f"Domaine: {answers.get('domaine')}."
        )
        
        # On utilise un client explicite pour éviter les variables d'env parasites
        client = ollama.Client(host='http://127.0.0.1:11434')
        
        response = client.chat(model='llama3', messages=[
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
        # Si ça plante encore, l'erreur s'affichera proprement dans ton React
        return {"result": f"Erreur de connexion locale : {str(e)}"}