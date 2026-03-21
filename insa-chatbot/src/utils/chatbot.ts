import knowledgeBase from "../data/chatbot/chatbotKnowledge.json";

type KnowledgeItem = {
  id: number;
  category: string;
  keywords: string[];
  answer: string;
};

export function findBestAnswer(userMessage: string): string {
  const message = userMessage.toLowerCase();

  let bestMatch: KnowledgeItem | null = null;
  let bestScore = 0;

  for (const item of knowledgeBase as KnowledgeItem[]) {
    let score = 0;

    for (const keyword of item.keywords) {
      if (message.includes(keyword.toLowerCase())) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  return "Désolée, je n’ai pas compris ta question. Peux-tu reformuler ?";
}