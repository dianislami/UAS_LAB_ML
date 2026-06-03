from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_service import InsectClassifier
from gemini_service import GeminiExpert
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LensArthropoda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = InsectClassifier(
    model_path="artifacts/model_traced.pt",
    metadata_path="artifacts/model_metadata.json"
)

gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_expert = GeminiExpert(api_key=gemini_api_key)


@app.get("/")
def root():
    return {"status": "LensArthropoda API is running"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    try:
        image_bytes = await file.read()

        # Jalankan inference model
        predictions = classifier.predict(image_bytes, top_k=3)
        top_prediction = predictions[0]["class"] if predictions else "Unknown"

        # Ambil AI insight dari Gemini
        try:
            ai_insight = gemini_expert.get_insect_info(top_prediction)
        except Exception as gemini_error:
            print(f"Gemini API error: {gemini_error}")
            ai_insight = (
                f"Sistem berhasil mengidentifikasi serangga ini sebagai **{top_prediction}**.\n\n"
                "Layanan AI Insights sedang mengalami lonjakan permintaan. "
                "Silakan coba lagi dalam beberapa saat."
            )

        return {
            "predictions": predictions,
            "top_prediction": top_prediction,
            "ai_insight": ai_insight
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))