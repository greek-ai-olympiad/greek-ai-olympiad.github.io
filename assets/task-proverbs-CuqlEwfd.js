const n=`import csv
import math

# Grade: the mean adjusted mutual information (AMI, as sklearn's adjusted_mutual_info_score,
# arithmetic normalisation) between the submitted labels and each annotator's clustering,
#   - final grade = clamp(mean AMI / 0.08 * 100, 0, 100),
#   - 0 if the number of clusters is outside [5, 17].
# AMI is 0 on average for a random clustering, whatever the number of clusters, so 0 = chance.
# 100 is the best reference solution found (multilingual sentence embeddings,
# paraphrase-multilingual-mpnet-base-v2, with Ward clustering: mean AMI 0.081), a demanding
# target; the annotators agree with each other at 0.096 (each against the other nine).
# (The contest graded plain NMI, clamp((NMI - 0.15) / 0.30 * 100): with 100 proverbs NMI rewards
# many clusters even when random, and a random 17-cluster answer outscored every contestant.)
# The contest also showed a public feedback metric over the first 50 proverbs and
# the first 5 annotators. requiredFiles/annotations.csv holds only that public part; the
# full 100 x 10 annotations are private (private/annotations.csv, same name). With them
# the grade is the contest's final grade; without them the same formula is applied to
# the public part.
N = 100
K_MIN, K_MAX = 5, 17
FULL_AMI = 0.08
PUBLIC_ROWS, PUBLIC_ANNOTATORS = 50, 5


def load_annotations(path="annotations.csv"):
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    cols = [c for c in rows[0].keys() if c != "id"]
    return [[r[c] for r in rows] for c in cols]


def _entropy(counts, n):
    return -sum(v / n * math.log(v / n) for v in counts.values())


def ami(a, b):
    """Adjusted mutual information with arithmetic normalisation, as in scikit-learn:
    (MI - E[MI]) / (mean(H(a), H(b)) - E[MI]), with E[MI] under random labelings of the same
    cluster sizes. Plain Python: the evaluation set is small, and this keeps the grader
    dependency-free."""
    n = len(a)
    ca, cb, counts = {}, {}, {}
    for x, y in zip(a, b):
        counts[(x, y)] = counts.get((x, y), 0) + 1
        ca[x] = ca.get(x, 0) + 1
        cb[y] = cb.get(y, 0) + 1
    if len(ca) == len(cb) == 1 or n == 0:
        return 1.0
    mi = sum(nij / n * math.log(nij * n / (ca[x] * cb[y])) for (x, y), nij in counts.items())
    lg = math.lgamma
    emi = 0.0
    for ai in ca.values():
        for bj in cb.values():
            for nij in range(max(1, ai + bj - n), min(ai, bj) + 1):
                log_p = (lg(ai + 1) + lg(bj + 1) + lg(n - ai + 1) + lg(n - bj + 1)
                         - lg(n + 1) - lg(nij + 1) - lg(ai - nij + 1) - lg(bj - nij + 1)
                         - lg(n - ai - bj + nij + 1))
                emi += nij / n * math.log(n * nij / (ai * bj)) * math.exp(log_p)
    denominator = (_entropy(ca, n) + _entropy(cb, n)) / 2 - emi
    denominator = min(denominator, -1e-12) if denominator < 0 else max(denominator, 1e-12)
    return (mi - emi) / denominator


def parse_answer(answer):
    """Accepts a list of cluster ids (null = no category), or the UI's
    {"labels": [...], "categories": [...]}. Uncategorised proverbs form one group."""
    if isinstance(answer, dict):
        answer = answer.get("labels")
    if not isinstance(answer, list):
        raise ValueError("the answer must be a list of cluster numbers")
    if len(answer) != N:
        raise ValueError(f"expected {N} cluster numbers, got {len(answer)}")
    labels, unassigned = [], 0
    for i, v in enumerate(answer):
        if v is None:
            labels.append("unassigned")
            unassigned += 1
        elif isinstance(v, bool) or not isinstance(v, (int, float)) or v != int(v):
            raise ValueError(f"item {i}: '{v}' is not an integer cluster number")
        else:
            labels.append(str(int(v)))
    return labels, unassigned


def evaluate(level_id, answer):
    try:
        labels, unassigned = parse_answer(answer)
    except ValueError as e:
        print(f"Invalid answer: {e}")
        return 0

    k = len(set(labels))
    note = f" ({unassigned} proverbs without a category count as one group)" if unassigned else ""
    if not K_MIN <= k <= K_MAX:
        print(f"{k} clusters{note}: the number of clusters must be between {K_MIN} and {K_MAX} -> 0")
        return 0

    annotators = load_annotations()
    has_private = len(annotators[0]) == N
    pub = [ami(labels[:PUBLIC_ROWS], gt[:PUBLIC_ROWS]) for gt in annotators[:PUBLIC_ANNOTATORS]]
    pub_mean = sum(pub) / len(pub)
    print(f"{k} clusters{note}")
    print(f"Public feedback (first {PUBLIC_ROWS} proverbs, {PUBLIC_ANNOTATORS} annotators): mean AMI = {pub_mean:.4f}")

    if has_private:
        per = [ami(labels, gt) for gt in annotators]
        mean = sum(per) / len(per)
        print(f"Final (all {N} proverbs, {len(annotators)} annotators): mean AMI = {mean:.4f}")
        print("AMI per annotator: " + ", ".join(f"{x:.3f}" for x in per))
    else:
        mean = pub_mean
        print("Graded on the public part; the final grade uses all 100 proverbs and 10 annotators.")
    grade = round(min(100.0, max(0.0, mean / FULL_AMI * 100)), 2)
    print(f"Grade: {grade}")
    return grade
`;export{n as default};
