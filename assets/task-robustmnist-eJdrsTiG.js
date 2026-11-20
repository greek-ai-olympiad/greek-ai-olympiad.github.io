const e=`intro: Upload the answers.json produced by the notebook, with the weights of your trained SmallMNISTCNN. Grading attacks your model with PGD (ε = 0.3).
upload: Load answers.json
loaded: Loaded "{name}"
noModel: No model loaded for this level yet.
valid: SmallMNISTCNN, {n} parameters
errJson: The file is not valid JSON.
errLevel: The file has no weights for level "{level}".
errWeights: The weights do not fit SmallMNISTCNN ({found} values instead of {expected}).
running: Computing predictions…
predsNote: Under each perturbed image you see your model's prediction.
correctCount: 'Correct predictions on the perturbed images: {k} / {n} ({pct})'
trueLabel: 'correct: {d}'
page: Page
imagesTotal: '{count} images'
privateNote: The private-set score is not shown here; it is computed by the organisers.
`;export{e as default};
