import json
import torch
import io
from pathlib import Path
from PIL import Image
import torchvision.transforms as transforms


class InsectClassifier:
    def __init__(self, model_path: str, metadata_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"InsectClassifier running on: {self.device}")

        self.model = torch.jit.load(model_path, map_location=self.device)
        self.model.eval()

        # Default
        self.class_names = None
        self.img_size = 300  # fallback kalau tidak ada metadata
    
        # Load class names dari metadata jika tersedia
        if metadata_path and Path(metadata_path).exists():
            with open(metadata_path, "r") as f:
                meta = json.load(f)
            self.class_names = meta.get("class_names")
            self.img_size = meta.get("img_size", 300)       # ← ambil dari metadata
            print(f"Loaded {len(self.class_names)} classes from metadata.")

        self.transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def predict(self, image_bytes: bytes, top_k: int = 3):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(tensor)
            probabilities = torch.softmax(output, dim=1)

        top_probs, top_indices = torch.topk(probabilities, top_k, dim=1)
    
        results = []
        for i in range(top_k):
            idx = top_indices[0, i].item()
            prob = top_probs[0, i].item()

            if self.class_names and idx < len(self.class_names):
                label = self.class_names[idx]
            else:
                label = f"class_{idx}"

            results.append({
                "class": label,
                "prob": round(prob, 4)
            })

        return results