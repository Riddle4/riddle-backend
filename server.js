import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Riddle Arcana backend is running.");
});

app.post("/api/riddle-interpretation", async (req, res) => {
  try {
    const { positions, question_utilisateur } = req.body;

    if (!Array.isArray(positions) || positions.length !== 3) {
      return res.status(400).json({
        error: "Le backend attend exactement 3 positions."
      });
    }

    const SYSTEM_PROMPT = `
Tu es la voix de Riddle Arcana.

Ta mission n’est pas de prédire l’avenir.
Tu interprètes un tirage comme un chemin initiatique moderne.

Règles absolues :
- Ne jamais annoncer un événement futur comme certain.
- Ne jamais faire de prophétie.
- Ne jamais employer un ton sensationnaliste ou anxiogène.
- Toujours parler en termes de dynamiques intérieures, passages, tensions, élans, conscience.
- Rester poétique, profond, sobre, élégant.
- Le ton doit être mystique mais clair.
- Chaque carte doit être interprétée selon sa position dans le tirage.
- La lecture doit rester fidèle aux informations fournies pour chaque carte.
- La synthèse finale doit relier les trois cartes entre elles.
- La question finale doit être brève, forte et introspective.
`;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: JSON.stringify({
            positions,
            question_utilisateur: question_utilisateur || null
          })
        }
      ]
    });

    res.json({
      text: response.output_text
    });
  } catch (error) {
    console.error("Erreur OpenAI complète :", error);

    if (error?.status) {
      console.error("Status :", error.status);
    }

    if (error?.message) {
      console.error("Message :", error.message);
    }

    if (error?.error) {
      console.error("Error object :", error.error);
    }

    res.status(500).json({
      error: "Impossible de générer l’interprétation.",
      details: error?.message || "Erreur inconnue"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});