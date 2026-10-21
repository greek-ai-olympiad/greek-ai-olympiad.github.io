const e=`*Adapted from the problem "Antique Painting Authentication" of the [International Olympiad in Artificial Intelligence (IOAI) 2025](https://ioai-official.org/china-2025) (Beijing, China), Individual Contest, Day 2. Original statement, data and solutions: [IOAI-official/IOAI-2025](https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Antique), CC BY 4.0. Change: you submit your predictions as a JSON file instead of a notebook.*

An old friend of your father, a famous archaeologist and art critic, has heard that you study artificial intelligence and asks for your help: you need to design an algorithm that tells whether an antique painting is **authentic** or a **replica**.

Because professional authentication is expensive, the research team has labels for only a tiny fraction of the paintings; for most of them, authenticity is unknown. It is known, however, that the paintings' digital features have a strong structure. You must use **all** the paintings, including the unlabelled ones, to train a model that classifies them.

## Data

Every painting is described by 5 numerical features. The notebook downloads three sets of 500 paintings each:

- **Training set** (\`training_set.csv\`): the 5 features and a sixth column, the label: \`1\` authentic, \`-1\` replica, \`0\` unknown. Only 4 paintings have a known label.
- **Test A** (\`validation_set.csv\`) and **Test B** (\`test_set.csv\`): only the 5 features.

## Submission

For each painting of Test A and Test B, predict \`1\` (authentic) or \`-1\` (replica), in the order of the file. The notebook writes the file you upload:

\`\`\`json
{"testA": [1, -1, ...], "testB": [1, -1, ...]}
\`\`\`

## Evaluation

The metric is **accuracy**: the fraction of paintings classified correctly. The higher the accuracy, the higher the score; guessing at random scores zero. You see your score on Test A right away, but only Test B counts in the end.
`;export{e as default};
