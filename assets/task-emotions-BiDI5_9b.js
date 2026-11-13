const e=`Emotion classification is an important problem in machine learning, where the goal is to recognize the emotion expressed by a person in an image. The FERPlus (Facial Expression Recognition Plus) model is one of the most successful models for this problem, and can classify facial images into 8 categories: neutral, happiness, surprise, sadness, anger, disgust, fear, and contempt.

**Goal of the Exercise**

In this exercise, you are asked to create two facial images in grayscale 112x112 pixels:
- **First image**: Must be classified as **not happy** (i.e., any class except happiness)
- **Second image**: Must be classified as **happy** (happiness class)

The critical part: the two images must have the **smallest possible pixel distance** between them. In other words, we want to show how we can "fool" the classifier by changing the image in the smallest possible way so that the image changes category.

**How It Works**

You can upload images from your computer, mobile phone, take a photo, or create images programmatically. Each image is automatically converted to grayscale and resized to 112x112 pixels. The FERPlus model runs in real-time in your browser and shows you the prediction along with the confidence level.`;export{e as default};
