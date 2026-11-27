const e=`import numpy as np
import json

with open('levels.json', 'r') as f:
    levels = json.load(f)

emotions = ['neutral', 'happiness', 'surprise', 'sadness', 'anger', 'disgust', 'fear', 'contempt']

def softmax(x):
    x = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=-1, keepdims=True)

def as_image(pixels):
    """A 112x112 grayscale image (values 0-255), or None."""
    try:
        img = np.array(pixels, dtype=np.float64)
    except (ValueError, TypeError):
        return None
    if img.size != 112 * 112 or not np.all(np.isfinite(img)):
        return None
    return img.reshape(112, 112)

def evaluate(level_id, answer):
    if level_id not in levels:
        return 0
    level_data = levels[level_id]
    answer = dict(answer) if isinstance(answer, dict) else {}
    # The level's fixed image (if any) replaces whatever the answer holds for it
    for key in ('first', 'second'):
        if key in level_data:
            answer[key] = level_data[key]
    img1, img2 = as_image(answer.get('first')), as_image(answer.get('second'))
    if img1 is None or img2 is None:
        print('Both images must be 112x112 grayscale pixel arrays.')
        return 0
    d = np.abs(img1 - img2).sum()
    # Use values directly in [0, 255] range for model inference
    x1 = (img1.reshape(1,1,112,112) / 255.0).tolist()
    result1 = run_onnx_inference(x1, level_data['model'])
    probabilities1 = softmax(result1[0])
    emotion1 = np.argmax(result1[0])

    x2 = (img2.reshape(1,1,112,112) / 255.0).tolist()
    result2 = run_onnx_inference(x2, level_data['model'])
    probabilities2 = softmax(result2[0])
    emotion2 = np.argmax(result2[0])

    print('Distance', d)
    print(f'Prediction 1: {emotions[emotion1]} ({probabilities1[emotion1]*100:.1f}%)')
    print(f'Prediction 2: {emotions[emotion2]} ({probabilities2[emotion2]*100:.1f}%)')
    if emotion1 == 1 or emotion2 != 1:
        return 0
    if level_id == 'easy':
        return max(1, np.round(100 - np.log(d)**2))
    elif level_id == 'medium':
        ratio = max(0, np.log(d/1500))
        return min(100, max(1, np.round(100 - ratio ** 2 * 20 )))
    elif level_id == 'hard':
        ratio = max(0, np.log(d/45))
        return min(100, max(1, np.round(100 - ratio ** 2 * 20 )))
    else:
        return 0
`;export{e as default};
