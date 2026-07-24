from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import math

app = FastAPI(title="PDF Glass Dimension Checker API")

# 允許跨域請求（讓你的前端網站可以順利呼叫此 API）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 部署時可改為你前端網站的網址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_target_blue(color_tuple):
    """
    判斷 RGB 顏色是否接近藍色 (Color 150 或常見工程藍)
    PyMuPDF 回傳的 RGB 數值範圍為 0.0 ~ 1.0
    """
    if not color_tuple:
        return False
    r, g, b = color_tuple[:3]
    
    # 判斷是否為藍色主導 (R, G 較低，B 較高) 或是標準 RGB(0, 0, 1)
    # 可根據你的 PDF 實際顏色數值稍微微調
    return b > 0.5 and r < 0.4 and g < 0.6

def extract_rectangles_from_drawings(page, mid_x):
    """提取向量線條構成的矩形，並依 X 座標分左右區"""
    left_rects = []
    right_rects = []
    
    drawings = page.get_drawings()
    for item in drawings:
        color = item.get("color")
        fill = item.get("fill")
        
        if is_target_blue(color) or is_target_blue(fill):
            rect = item["rect"]  # [x0, y0, x1, y1]
            w = round(abs(rect.width), 2)
            h = round(abs(rect.height), 2)
            
            # 過濾太小的微小線段/點 (例如小於 10 pt)
            if w > 10 and h > 10:
                obj_data = {
                    "w": w,
                    "h": h,
                    "bbox": [rect.x0, rect.y0, rect.x1, rect.y1]
                }
                if rect.x0 < mid_x:
                    left_rects.append(obj_data)
                else:
                    right_rects.append(obj_data)
                    
    return left_rects, right_rects

def extract_dimensions_from_text(page, mid_x):
    """提取藍色標註文字（數字）"""
    left_dims = []
    blocks = page.get_text("dict")["blocks"]
    
    for b in blocks:
        if "lines" in b:
            for line in b["lines"]:
                for span in line["spans"]:
                    # 解析文字顏色
                    color_int = span["color"]
                    r = ((color_int >> 16) & 255) / 255.0
                    g = ((color_int >> 8) & 255) / 255.0
                    b_val = (color_int & 255) / 255.0
                    
                    if is_target_blue((r, g, b_val)):
                        text_str = span["text"].strip()
                        # 嘗試轉為數字 (標註尺寸)
                        try:
                            val = float(text_str)
                            if val > 10: # 過濾掉太小的數字
                                if span["bbox"][0] < mid_x:
                                    left_dims.append(val)
                        except ValueError:
                            pass
    return left_dims

@app.post("/api/verify-pdf")
async def verify_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="請上傳 PDF 檔案")

    # 1. 讀取 PDF 檔案內容
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    
    if len(doc) == 0:
        raise HTTPException(status_code=400, detail="PDF 檔案為空")
        
    page = doc[0]  # 預設檢查第一頁
    page_width = page.rect.width
    mid_x = page_width / 2.0  # 以頁面寬度中央劃分左右區
    
    # 2. 解析左右區的幾何矩形與文字標註
    left_rects, right_rects = extract_rectangles_from_drawings(page, mid_x)
    left_dims = extract_dimensions_from_text(page, mid_x)
    
    # 3. 整合左圖的「幾何尺寸」與「文字標註」(標註優先修正幾何)
    for l_obj in left_rects:
        for d_val in left_dims:
            if abs(l_obj["w"] - d_val) < 50.0:
                l_obj["w"] = d_val
            if abs(l_obj["h"] - d_val) < 50.0:
                l_obj["h"] = d_val

    # 4. 排序（依 Y 座標由上至下、X 座標由左至右）
    left_rects.sort(key=lambda item: (-item["bbox"][1], item["bbox"][0]))
    right_rects.sort(key=lambda item: (-item["bbox"][1], item["bbox"][0]))

    # 5. 精準比對左右兩區尺寸
    discrepancies = []
    
    for i, r_obj in enumerate(right_rects):
        r_w, r_h = r_obj["w"], r_obj["h"]
        
        # 尋找對應的左圖物件
        if i < len(left_rects):
            l_obj = left_rects[i]
        else:
            # 若數量不匹配，尋找尺寸最接近者
            l_obj = min(
                left_rects, 
                key=lambda item: abs(item["w"] - r_w) + abs(item["h"] - r_h),
                default=None
            )
            
        if l_obj:
            l_w, l_h = l_obj["w"], l_obj["h"]
            
            # 容差 0.5 mm / pt 判定
            if abs(r_w - l_w) > 0.5 or abs(r_h - l_h) > 0.5:
                discrepancies.append({
                    "error_index": len(discrepancies) + 1,
                    "target_bbox": r_obj["bbox"], # 右區錯誤物件的 PDF 座標 [x0, y0, x1, y1]
                    "right_size": {"w": r_w, "h": r_h},
                    "expected_size": {"w": l_w, "h": l_h},
                    "message": f"右圖尺寸 ({r_w} x {r_h}) 與左圖標註 ({l_w} x {l_h}) 不相符！"
                })

    # 6. 回傳比對結果 JSON
    return {
        "success": True,
        "page_dimensions": {"width": page.rect.width, "height": page.rect.height},
        "left_count": len(left_rects),
        "right_count": len(right_rects),
        "error_count": len(discrepancies),
        "discrepancies": discrepancies
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
