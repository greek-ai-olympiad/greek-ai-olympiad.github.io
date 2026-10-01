const n=`import json
import os

# Ported from IOAI 2026, Robot Chasing (code/grading-original/check.py). The contest read
# predictions.json; here the same list arrives as JSON:
#   {"testA": [3600 actions], "testB": [3600 actions]}      each action an integer 0-5
# in the order of the test set's observations.json. Metric: mean per-robot accuracy (accuracy per
# robot, averaged over the 6 robots). Points: 0 at random guessing (1/6), 100 at the best fair
# reference solution (tests/token_cnn.py, 0.62055 on Test A), linear in between and clamped.
LEVEL_FILES = {"testA": "answers_A.json", "testB": "answers_B.json"}
N = 3600
CHANCE = 1 / 6
BEST = 0.62055


def evaluate(level_id, answer):
    if level_id not in LEVEL_FILES:
        print(f"Unknown level {level_id}")
        return 0
    has_truth = os.path.exists(LEVEL_FILES[level_id])
    if not isinstance(answer, list) or len(answer) != N:
        print(f"[!] Invalid submission: expected a list of {N} actions, got "
              f"{len(answer) if isinstance(answer, list) else type(answer).__name__}")
        return 0 if has_truth else -1
    bad = [i for i, a in enumerate(answer) if not isinstance(a, int) or isinstance(a, bool) or not 0 <= a <= 5]
    if bad:
        print(f"[!] Invalid submission: row {bad[0]} has {answer[bad[0]]!r}; actions are integers 0-5")
        return 0 if has_truth else -1
    if not has_truth:
        print(f"{level_id}: valid submission. This level is graded after the contest.")
        return -1

    with open(LEVEL_FILES[level_id]) as f:
        truth = json.load(f)
    per_robot = []
    for robot in range(6):
        rows = [i for i, r in enumerate(truth["robot_id"]) if r == robot]
        per_robot.append(sum(answer[i] == truth["actions"][i] for i in rows) / len(rows))
    accuracy = sum(per_robot) / 6
    points = round(max(0.0, min(100.0, 100 * (accuracy - CHANCE) / (BEST - CHANCE))), 2)
    print(f"{level_id}: accuracy per robot " + ", ".join(f"{a:.3f}" for a in per_robot))
    print(f"mean per-robot accuracy {accuracy:.4f} -> {points} points")
    return points
`;export{n as default};
