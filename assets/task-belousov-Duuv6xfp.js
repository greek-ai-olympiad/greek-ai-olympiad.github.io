const e=`intro: 'Upload the answers.json produced by the notebook: your network''s architecture and weights, together with the features of the evaluation photos.'
upload: Load answers.json
loaded: Loaded "{name}"
noModel: No model loaded for this level yet.
network: Network
params: '{n} parameters'
features: '{a} features per photo, μ(a) = {mu}'
rows: '{rows} feature rows'
errJson: The file is not valid JSON.
errLevel: The file has no submission for {level}.
photos: Evaluation photos
page: Page
photosTotal: '{count} photos'
privateNote: The hidden testB is graded after the contest.
summary: Score = {score} → {points} points (mean Score_i {mean} × μ(a) {mu})
predicted: Predicted
actual: Actual
errModel: 'The network cannot be run: {msg}'
`;export{e as default};
