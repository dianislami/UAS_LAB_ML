import os
from google import genai
from google.genai import types


class GeminiExpert:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY tidak ditemukan di environment")
        self.client = genai.Client(api_key=api_key)

    def get_insect_info(self, insect_name: str) -> str:
        prompt = f"""
Berdasarkan hasil identifikasi gambar, serangga ini adalah "{insect_name}".

Berikan informasi lengkap dan menarik dengan format Markdown berikut (gunakan heading, bold, dan bullet points):

## Identifikasi
- **Nama Ilmiah:** 
- **Nama Umum:** 
- **Famili:** 
- **Genus:** 

## Taksonomi
Jelaskan secara singkat posisi taksonomi serangga ini dalam 2-3 kalimat.

## Habitat & Persebaran
Jelaskan di mana serangga ini biasanya ditemukan, preferensi lingkungan, dan persebarannya secara geografis.

## Peran Ekologis
Jelaskan peran serangga ini dalam ekosistem (predator, penyerbuk, hama, dekomposer, dll).

## Fakta Unik
Berikan 2-3 fakta menarik dan jarang diketahui tentang serangga ini.

Berikan jawaban langsung tanpa kalimat pembuka seperti "Tentu" atau "Berikut adalah".
"""

        contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]

        generate_content_config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=512),
            temperature=0.7,
            max_output_tokens=1500,
            tools=[types.Tool(google_search=types.GoogleSearch())],
        )

        response_text = ""
        for chunk in self.client.models.generate_content_stream(
            model="gemini-2.5-flash-lite",
            contents=contents,
            config=generate_content_config,
        ):
            if chunk.text:
                response_text += chunk.text

        return response_text