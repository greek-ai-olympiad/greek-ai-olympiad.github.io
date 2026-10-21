const n=`import json
import os

# Ported from IOAI 2025, Antique Painting Authentication (Scoring/metrics.py). The contest read
# submissionA.csv / submissionB.csv; here the same predictions arrive as JSON:
#   {"testA": [1, -1, ...], "testB": [...]}      500 labels per set, each 1 (authentic) or -1 (replica)
# Metric: accuracy. Points: 0 at chance (0.5), 100 at the best fair reference solution
# (tests/spectral.py, accuracy 0.99 on both sets), linear in between and clamped.
LEVEL_FILES = {"testA": "labels_A.json", "testB": "labels_B.json"}
N = 500
CHANCE = 0.5
BEST = 0.99


def evaluate(level_id, answer):
    if level_id not in LEVEL_FILES:
        print(f"Unknown level {level_id}")
        return 0
    has_truth = os.path.exists(LEVEL_FILES[level_id])
    if not isinstance(answer, list) or len(answer) != N:
        print(f"[!] Invalid submission: expected a list of {N} labels, got "
              f"{len(answer) if isinstance(answer, list) else type(answer).__name__}")
        return 0 if has_truth else -1
    bad = [i for i, v in enumerate(answer) if v not in (1, -1) or isinstance(v, bool)]
    if bad:
        print(f"[!] Invalid submission: every label must be 1 or -1 (position {bad[0]} is {answer[bad[0]]!r})")
        return 0 if has_truth else -1
    if not has_truth:
        print(f"{level_id}: valid submission. This level is graded after the contest.")
        return -1

    with open(LEVEL_FILES[level_id]) as f:
        truth = json.load(f)
    accuracy = sum(p == t for p, t in zip(answer, truth)) / N
    points = round(max(0.0, min(100.0, 100 * (accuracy - CHANCE) / (BEST - CHANCE))), 2)
    print(f"{level_id}: accuracy {accuracy:.3f} -> {points} points")
    return points
`;export{n as default};
