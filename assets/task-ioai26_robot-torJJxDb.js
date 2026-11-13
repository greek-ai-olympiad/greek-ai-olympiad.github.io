const e=`*Adapted from the problem "Robot Chasing" of the [International Olympiad in Artificial Intelligence (IOAI) 2026](https://ioai-official.org/republic-of-kazakhstan/) (Astana, Kazakhstan), Individual Contest, Day 1. Original statement and code: [IOAI-official/IOAI-2026](https://github.com/IOAI-official/IOAI-2026/tree/main/Individual-Contest/2_Robot_Chasing); data: [IOAI-official/ioai-2026-robot-chasing](https://huggingface.co/datasets/IOAI-official/ioai-2026-robot-chasing); CC BY 4.0. Change: you submit your predictions for the two test sets as a JSON file instead of a notebook that is run on them.*

There are six robots. Each one moves in a small room: a $6 \\times 6$ playable area surrounded by walls, so the whole room is an $8 \\times 8$ array. Each robot receives an English instruction describing a mission, and a snapshot is taken at some moment while it carries it out. **Predict the robot's next action.**

Robots do not always follow the shortest path. Robot 0 may behave differently from robot 1, but each robot follows its own consistent pattern. Use the training examples, which include the correct next action, to learn these patterns.

There are three types of missions:

- **go to** an object, e.g. \`"approach the red ball"\`;
- **pick up** an object, e.g. \`"grab the blue key"\`;
- **put one object next to another**, e.g. \`"place the red box beside the green ball"\`.

The same instruction can be written in several ways. The test sets may contain new combinations of familiar phrases, colors and object types, but every word, phrase pattern, color, object type and mission type in them also appears in the training set.

## Data

Every observation has the following fields:

| Field | Meaning |
|---|---|
| \`robot_id\` | which of the 6 robots it is (\`0\`–\`5\`) |
| \`image\` | the room, an $8 \\times 8 \\times 2$ array: \`image[row][column] = [object, color]\` |
| \`direction\` | the direction the robot faces: 0 up, 1 down, 2 left, 3 right |
| \`mission\` | the instruction, in English |
| \`carrying\` | \`null\`, or \`[object, color]\` of the object the robot is carrying |

Objects: 1 empty cell, 2 wall, 5 key, 6 ball, 7 box, 10 robot, 11 token. Tokens may appear in the room but are never named in missions. Colors: 0 red, 1 green, 2 blue, 3 purple, 4 yellow, 5 grey (meaningless for empty cells and walls).

Actions: 0 move up, 1 move down, 2 move left, 3 move right, 4 pick up, 5 drop. A move first turns the robot in that direction and then tries to move it one cell (a wall or an object may block it). Pick up and drop act on the cell in front of the robot.

Observations are independent snapshots in random order: they do not form episodes, and no previous observation or action is given.

The notebook downloads the **training set** (60,000 observations with their next action) and the observations of **Test A** and **Test B** (3,600 each, 600 per robot).

## Submission

One action (\`0\`–\`5\`) for every observation of Test A and Test B, in the order of the files. The notebook writes the file you upload:

\`\`\`json
{"testA": [0, 3, 2, ...], "testB": [1, 4, 0, ...]}
\`\`\`

## Evaluation

The metric is **mean per-robot accuracy**: the accuracy is computed for each robot separately and then averaged over the six robots, so every robot counts the same. The higher it is, the higher the score. You see your score on Test A right away, but only Test B counts in the end.
`;export{e as default};
