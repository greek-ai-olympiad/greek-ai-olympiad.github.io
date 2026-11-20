const e=`intro: Upload the submission.json produced by the notebook, with the number of a gallery image for every query of Test A and Test B.
upload: Load submission.json
loaded: Loaded "{name}"
errJson: The file is not valid JSON.
errLevel: The file has no answers for {level}.
errCount: '{got} answers, {n} needed'
errValue: 'Query {q} has no number from 1 to {max}'
ok: Valid answer
privateNote: The hidden Test B is graded after the contest.
queries: The level's queries
matches: Your matches
gallery: The gallery
correct: 'Correct matches: {correct} of {n}'
`;export{e as default};
