const o=`intro: Upload the submission.json produced by the notebook, with one action (0–5) for every observation of Test A and Test B.
upload: Load submission.json
loaded: Loaded "{name}"
errJson: The file is not valid JSON.
errLevel: The file has no answers for {level}.
errCount: '{got} actions, 3600 needed'
errValue: 'Row {row} has no action from 0 to 5'
ok: Valid answer
privateNote: The hidden Test B is graded after the contest.
perRobot: Accuracy per robot
mean: mean
rooms: The level's first observations
roomsTotal: '{count} of the 3600 observations'
page: Page
robot: robot {id}
carrying: carrying something
predicted: Predicted
actual: Correct action
actions: [up, down, left, right, pick up, drop]
`;export{o as default};
