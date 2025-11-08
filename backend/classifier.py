import os
import configparser
import numpy as np
from huggingface_hub import InferenceClient
from sklearn.metrics.pairwise import cosine_similarity

class IncidentClassifier:
    def __init__(self):
        print("🚀 初始化 Hugging Face 客戶端...")

        hf_token = self._load_hf_token()
        self.client = InferenceClient(
            provider="hf-inference",
            api_key=hf_token,
        )
        self.model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

        self.category_descriptions = {
            "性騷擾": [
                "性騷擾 不當身體接觸 性暗示",
                "摸臀部 摸胸部 性侵害 性行為",
                "色狼 鹹豬手 性器官接觸"
            ],
            "跟蹤": [
                "跟蹤 尾隨 一直跟著",
                "有人跟著我 被人盯上 一路跟隨",
                "徘徊 守候 監視 出現在我身邊"
            ],
            "偷拍": [
                "偷拍 拍照 攝影 手機鏡頭",
                "裙底拍攝 針孔攝影機 偷錄",
                "相機對著我 拍攝私密部位"
            ],
            "言語騷擾": [
                "言語騷擾 辱罵 騷擾話語",
                "說髒話 性暗示言論 調戲 吹口哨",
                "挑逗言語 下流話 色情言論"
            ],
            "肢體騷擾": [
                "肢體騷擾 推擠 碰觸 身體接觸",
                "故意碰撞 擋路 靠近 貼近",
                "拉扯 抓住 不當肢體動作"
            ],
            "其他": [
                "其他狀況 奇怪行為 可疑",
                "感覺不對勁 危險 威脅",
                "不明騷擾 異常情況"
            ]
        }

        print("⚙️ 從 Hugging Face 載入類別 embeddings...")
        self.category_embeddings = self._build_category_embeddings()
        print("✅ 分類器初始化完成！")

    @staticmethod
    def _load_hf_token():
        """從 config.ini 或環境變數載入 HF Token"""
        config_path = os.path.join(os.path.dirname(__file__), "config.ini")

        # 優先讀 config.ini
        if os.path.exists(config_path):
            config = configparser.ConfigParser()
            config.read(config_path, encoding="utf-8")
            if "HuggingFace" in config and "HF_TOKEN" in config["HuggingFace"]:
                token = config["HuggingFace"]["HF_TOKEN"].strip()
                if token:
                    print("使用 config.ini 中的 HF token。")
                    return token

        # 退回環境變數
        token = os.environ.get("HF_TOKEN")
        if token:
            print("使用環境變數 HF_TOKEN（生產環境）。")
            return token

        print("⚠️ 警告：未找到 HF token（config.ini 或環境變數）。")
        return None

    def _embed(self, text: str) -> np.ndarray:
        """使用 InferenceClient 的 feature_extraction 取得句向量"""
        result = self.client.feature_extraction(text=text, model=self.model_name)

        # Hugging Face 可能回傳 list 或 ndarray
        if isinstance(result, list):
            token_embeddings = np.array(result)
            return np.mean(token_embeddings, axis=0).astype(np.float32)
        elif isinstance(result, np.ndarray):
            return np.mean(result, axis=0).astype(np.float32) if result.ndim == 2 else result.astype(np.float32)
        else:
            raise RuntimeError(f"Unexpected embedding result type: {type(result)}")

    def _build_category_embeddings(self):
        cat_emb = {}
        for category, descriptions in self.category_descriptions.items():
            print(f"  🧩 類別: {category}")
            vectors = [self._embed(desc) for desc in descriptions]
            cat_emb[category] = np.mean(vectors, axis=0)
        return cat_emb

    def classify_with_confidence(self, title: str, content: str) -> dict:
        """分類並返回置信度"""
        text = f"{title} {title} {content}"
        text_emb = self._embed(text)

        similarities = {
            category: float(cosine_similarity([text_emb], [emb])[0][0])
            for category, emb in self.category_embeddings.items()
        }

        predicted = max(similarities, key=similarities.get)
        confidence = similarities[predicted]

        return {
            "category": predicted,
            "confidence": confidence,
            "all_scores": similarities
        }
