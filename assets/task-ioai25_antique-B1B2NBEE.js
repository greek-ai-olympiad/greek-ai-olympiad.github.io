const e=`intro: Upload the submission.json produced by the notebook, with one prediction (1 or -1) for every painting of Test A and Test B.
upload: Load submission.json
loaded: Loaded "{name}"
errJson: The file is not valid JSON.
errLevel: The file has no answers for {level}.
ok: Valid answer
privateNote: The hidden Test B is graded after the contest.
plot: The level's paintings (features 1 and 2), with your predictions
authentic: authentic (1)
replica: replica (-1)
noPrediction: no prediction
wrong: wrong prediction
accuracy: 'Accuracy: {value}%'
`;export{e as default};
