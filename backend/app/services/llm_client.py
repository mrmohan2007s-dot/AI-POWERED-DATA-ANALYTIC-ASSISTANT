from typing import Optional

import httpx

import app.config as config


async def complete(prompt: str, system: str = "", temperature: float = 0.2) -> Optional[str]:
    """Call the configured provider; return None when local fallback is selected."""
    provider = (config.LLM_PROVIDER or "local").lower()
    if provider == "local":
        return None

    if provider == "gemini":
        if not config.GEMINI_API_KEY:
            return None
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                params={"key": config.GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": f"{system}\n\n{prompt}" if system else prompt}]}],
                    "generationConfig": {"temperature": temperature},
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()

    providers = {
        "openai": (config.OPENAI_API_KEY, "https://api.openai.com/v1/chat/completions", "gpt-4o-mini"),
        "groq": (config.GROQ_API_KEY, "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile"),
    }
    provider_config = providers.get(provider)
    if not provider_config:
        raise ValueError(f"Unsupported LLM provider: {provider}")
    key, url, model = provider_config
    if not key:
        return None

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            url,
            headers={"Authorization": f"Bearer {key}"},
            json={"model": model, "messages": messages, "temperature": temperature},
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
