const n=`import json
import os

# Ported from IOAI 2025, Restroom Icon Matching (Solution/Scoring/metrics.py). The contest read
# submission_a.npy / submission_b.npy; here the same arrays arrive as JSON:
#   {"testA": [10 gallery numbers], "testB": [30 gallery numbers]}
# one per query image (query/1.png, query/2.png, ...), each the number of the matching gallery
# image (gallery/<n>.png, numbered from 1). Metric: accuracy (precision@1). Points: 100 x accuracy;
# the best fair reference solution (tests/clip_pairs.py) matches every query.
LEVELS = {"testA": ("answer_A.json", 10), "testB": ("answer_B.json", 30)}


def evaluate(level_id, answer):
    if level_id not in LEVELS:
        print(f"Unknown level {level_id}")
        return 0
    path, n = LEVELS[level_id]
    has_truth = os.path.exists(path)
    if not isinstance(answer, list) or len(answer) != n:
        print(f"[!] Invalid submission: expected a list of {n} gallery numbers, got "
              f"{len(answer) if isinstance(answer, list) else type(answer).__name__}")
        return 0 if has_truth else -1
    bad = [i for i, v in enumerate(answer) if not isinstance(v, int) or isinstance(v, bool) or not 1 <= v <= 2 * n]
    if bad:
        print(f"[!] Invalid submission: query {bad[0] + 1} has {answer[bad[0]]!r}; gallery numbers go from 1 to {2 * n}")
        return 0 if has_truth else -1
    if not has_truth:
        print(f"{level_id}: valid submission. This level is graded after the contest.")
        return -1

    with open(path) as f:
        truth = json.load(f)
    correct = sum(p == t for p, t in zip(answer, truth))
    points = round(100 * correct / n, 2)
    print(f"{level_id}: {correct} of {n} queries matched -> {points} points")
    return points
`;export{n as default};
