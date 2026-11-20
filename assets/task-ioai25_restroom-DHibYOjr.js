const e=`*Adapted from the problem "Restroom Icon Matching" of the [International Olympiad in Artificial Intelligence (IOAI) 2025](https://ioai-official.org/china-2025) (Beijing, China), Individual Contest, Day 2. Original statement, data and solutions: [IOAI-official/IOAI-2025](https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom), CC BY 4.0. Change: you submit your matches as a JSON file instead of a notebook.*

Every restroom has its own style of icons for its men's and women's rooms. Train a model that learns the relationship between the **male and female icons of the same restroom**: given a query image, find its **counterpart of the opposite gender** from the same restroom.

For example, for a cropped male icon, the answer is the original (uncropped) photo of the female icon of the same restroom.

## Data

The notebook downloads the images from the IOAI repository.

- **Training set** (82 restrooms): four images per restroom, with the same number \`i\` in four folders: \`crop/male/i.png\` and \`crop/female/i.png\` (cropped icons), \`orig/male/i.png\` and \`orig/female/i.png\` (original photos).
- **Test A** (10 queries) and **Test B** (30 queries): a \`query/\` folder with cropped icons and a \`gallery/\` folder with original photos. For every query, the gallery holds exactly two originals from its restroom (one male, one female), so the gallery has twice as many images as there are queries. The file numbers are shuffled independently in the two folders, so they tell you nothing about the matches.

## Task

For every query, find the gallery image that is **of the opposite gender** and comes **from the same restroom**.

## Submission

For each query (\`query/1.png\`, \`query/2.png\`, ...) the number of the matching gallery image (\`gallery/<n>.png\`, numbers start at 1). The notebook writes the file you upload:

\`\`\`json
{"testA": [2, 18, ...], "testB": [37, 13, ...]}
\`\`\`

## Evaluation

The metric is **accuracy**: the fraction of queries matched correctly. The higher the accuracy, the higher the score. You see your score on Test A right away, but only Test B counts in the end.
`;export{e as default};
