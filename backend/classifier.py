from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os

class IncidentClassifier:
    def __init__(self):
        # 模型會自動下載到 ~/.cache/torch/sentence_transformers/
        # 第一次執行會下載，之後會使用快取，不會重複下載
        # 建議：在 Cloud Run 部署時，把模型打包進 Docker image
        
        model_name = 'paraphrase-multilingual-MiniLM-L12-v2'
        
        # 如果有本地模型檔案就用本地的（加速載入）
        local_model_path = './models/multilingual-MiniLM'
        if os.path.exists(local_model_path):
            print(f"✓ 使用本地模型: {local_model_path}")
            self.model = SentenceTransformer(local_model_path)
        else:
            print(f"⚠ 下載模型: {model_name} (首次執行需要約30秒)")
            self.model = SentenceTransformer(model_name)
        
        # 定義每個類別的參考描述
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
        
        print("⚙ 計算類別 embeddings...")
        # 預先計算所有參考描述的 embeddings（只在初始化時計算一次）
        self.category_embeddings = {}
        for category, descriptions in self.category_descriptions.items():
            embeddings = self.model.encode(descriptions, show_progress_bar=False)
            # 取平均作為該類別的代表 embedding
            self.category_embeddings[category] = np.mean(embeddings, axis=0)
        
        print("✓ 分類器初始化完成！")
    
    def classify(self, title: str, content: str) -> str:
        """
        分類貼文為事件類型
        
        Args:
            title: 貼文標題
            content: 貼文內容
            
        Returns:
            分類結果（六種類型之一）
        """
        # 結合標題和內容（標題權重較高，所以重複兩次）
        text = f"{title} {title} {content}"
        
        # 計算輸入文本的 embedding
        text_embedding = self.model.encode([text], show_progress_bar=False)[0]
        
        # 計算與每個類別的相似度
        similarities = {}
        for category, category_emb in self.category_embeddings.items():
            similarity = cosine_similarity(
                [text_embedding], 
                [category_emb]
            )[0][0]
            similarities[category] = similarity
        
        # 返回相似度最高的類別
        return max(similarities, key=similarities.get)
    
    def classify_with_confidence(self, title: str, content: str) -> dict:
        """
        分類並返回信心分數
        
        Returns:
            {
                "category": "偷拍",
                "confidence": 0.78,
                "all_scores": {"性騷擾": 0.65, "跟蹤": 0.55, ...}
            }
        """
        text = f"{title} {title} {content}"
        text_embedding = self.model.encode([text], show_progress_bar=False)[0]
        
        similarities = {}
        for category, category_emb in self.category_embeddings.items():
            similarity = cosine_similarity(
                [text_embedding], 
                [category_emb]
            )[0][0]
            similarities[category] = float(similarity)
        
        predicted_category = max(similarities, key=similarities.get)
        confidence = similarities[predicted_category]
        
        return {
            "category": predicted_category,
            "confidence": confidence,
            "all_scores": similarities
        }
