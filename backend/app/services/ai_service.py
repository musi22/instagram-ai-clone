import random
import hashlib
import json
import httpx
from typing import List
from app.core.config import settings

class AiService:
    def moderate_content(self, caption: str, image_desc: str) -> dict:
        """Scan caption and description for toxicity or unsafe content using Gemini API."""
        if not settings.GEMINI_API_KEY:
            return self._moderate_content_fallback(caption, image_desc)
            
        try:
            prompt = (
                "Analyze the following caption and image description for moderation. "
                "Classify it and return a raw JSON object with these exact keys: "
                "\"flag\": boolean (true if it contains NSFW/nudity, harassment, hate speech, or extreme violence; false otherwise), "
                "\"toxicityScore\": float between 0.0 and 100.0, "
                "\"category\": string (one of: 'Clean', 'NSFW', 'Violence', 'Harassment').\n\n"
                f"Caption: {caption}\n"
                f"Image Description: {image_desc}\n\n"
                "Return ONLY the JSON object. Do not wrap it in markdown backticks or formatting."
            )
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            with httpx.Client(timeout=10.0) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    text_content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Clean potential markdown backticks
                    if text_content.startswith("```"):
                        lines = text_content.splitlines()
                        if lines[0].startswith("```json"):
                            text_content = "\n".join(lines[1:-1])
                        else:
                            text_content = "\n".join(lines[1:-1])
                    result = json.loads(text_content)
                    return {
                        "flag": bool(result.get("flag", False)),
                        "toxicityScore": float(result.get("toxicityScore", 2.0)),
                        "category": str(result.get("category", "Clean"))
                    }
        except Exception as e:
            print(f"Warning: Gemini moderation API request failed, using fallback: {e}")
            
        return self._moderate_content_fallback(caption, image_desc)

    def _moderate_content_fallback(self, caption: str, image_desc: str) -> dict:
        full_text = (caption or "").lower() + " " + (image_desc or "").lower()
        if "violence" in full_text or "kill" in full_text:
            return {"flag": True, "toxicityScore": 85.0, "category": "Violence"}
        elif "nude" in full_text or "nsfw" in full_text or "naked" in full_text:
            return {"flag": True, "toxicityScore": 90.0, "category": "NSFW"}
        elif "harass" in full_text or "hate" in full_text:
            return {"flag": True, "toxicityScore": 75.0, "category": "Harassment"}
        return {"flag": False, "toxicityScore": random.randint(1, 5), "category": "Clean"}

    def generate_caption_ideas(self, image_desc: str) -> List[str]:
        """Generate alternative creative captions based on description using Gemini API."""
        if not settings.GEMINI_API_KEY:
            return self._generate_caption_ideas_fallback(image_desc)
            
        try:
            prompt = (
                f"Generate 3 creative and engaging Instagram caption ideas based on the following image description: '{image_desc}'. "
                "Return the response as a raw JSON array of 3 strings. Example: [\"Caption 1\", \"Caption 2\", \"Caption 3\"]. "
                "Return ONLY the JSON array. Do not include markdown backticks, explanations, or formatting."
            )
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            with httpx.Client(timeout=10.0) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    text_content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text_content.startswith("```"):
                        lines = text_content.splitlines()
                        if lines[0].startswith("```json"):
                            text_content = "\n".join(lines[1:-1])
                        else:
                            text_content = "\n".join(lines[1:-1])
                    result = json.loads(text_content)
                    if isinstance(result, list) and len(result) > 0:
                        return [str(x) for x in result[:3]]
        except Exception as e:
            print(f"Warning: Gemini caption ideas API request failed, using fallback: {e}")
            
        return self._generate_caption_ideas_fallback(image_desc)

    def _generate_caption_ideas_fallback(self, image_desc: str) -> List[str]:
        desc = image_desc or "something beautiful"
        return [
            f"Chasing moments in {desc}. ✨📸",
            f"When the aesthetic is just right: {desc}. 🌅🎨",
            f"Lost in the details of {desc}. What do you think?"
        ]

    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate a 384-dimensional vector embedding.
        If HF_TOKEN is configured, this queries the free Hugging Face Serverless Inference API
        using sentence-transformers/all-MiniLM-L6-v2; otherwise falls back to keyword-hashed vectors.
        """
        if not settings.HF_TOKEN:
            return self._generate_embeddings_fallback(text)
            
        try:
            url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
            headers = {"Authorization": f"Bearer {settings.HF_TOKEN}"}
            payload = {"inputs": text}
            
            with httpx.Client(timeout=10.0) as client:
                response = client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    vector = response.json()
                    if isinstance(vector, list) and len(vector) == 384:
                        return [float(x) for x in vector]
                    else:
                        print(f"Warning: HF embedding size {len(vector)} does not match 384, falling back.")
        except Exception as e:
            print(f"Warning: Hugging Face embedding API failed, using fallback: {e}")
            
        return self._generate_embeddings_fallback(text)

    def _generate_embeddings_fallback(self, text: str) -> List[float]:
        words = [w.strip(".,!?#@").lower() for w in text.split() if len(w.strip(".,!?#@")) > 1]
        vector = [0.0] * 384
        if not words:
            words = ["default"]
        for word in words:
            word_hash = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            rng = random.Random(word_hash)
            for i in range(384):
                vector[i] += rng.uniform(-1.0, 1.0)
        magnitude = sum(x * x for x in vector) ** 0.5
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        return vector

ai_service = AiService()
