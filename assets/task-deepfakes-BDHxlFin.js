const n=`import json
import numpy as np
from PIL import Image

with open('levels.json', 'r') as f: 
    levels = json.load(f)

def evaluate(levelId, answer):
    if not answer: return 0
    images = levels.get(levelId, [])
    score = 0
    total = 0
    for d in images:
        if 'label' not in d: continue
        image = d.get('image')
        total += 1
        pred = image in answer
        real = d['label'] == 'real'
        if pred == real:
            score += 1
        else:
            score += 0
    print(total, score)
    if total > 0: print(f'Accuracy {score * 100 / total:.2f}')
    if total == 0: return -1
    if 'sm' in levelId:
        if score > total * 0.88: return 100
        elif score > total * 0.65: return 50
        else: return 0
    else:
        if score > total * 0.92: return 100
        elif score > total * 0.615: return 50
        else: return 0

def generate(levelId):
    images = levels.get(levelId, [])
    
    # ImageNet normalization constants (same as PyTorch)
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    # Process images and create batch
    batch_images = []
    for d in images:
        img_path = 'images/'+ d.get('image')
        img = Image.open(img_path).convert('RGB')
        img = img.resize((112, 112), Image.Resampling.LANCZOS)
        img_array = np.array(img, dtype=np.float32)
        img_array = img_array / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))
        for c in range(3):
            img_array[c] = (img_array[c] - mean[c]) / std[c]
        
        batch_images.append(img_array)

    # Stack into batch: shape (4, 3, 112, 112)
    x = np.stack(batch_images, axis=0).tolist()

    # Run inference (same as your example)
    result = run_onnx_inference(x, "shufflenetv2.onnx", input_name=None)

    answers = [d.get('image') for d,r in zip(images, result) if r[1] > r[0]]
    
    return '-'.join(answers)`;export{n as default};
