const e=`import base64
import csv
import json
import math
import os
import struct

# Ported from the contest grader (grader_chemistry.py). The contest received
# submission.npz; here the same content arrives as JSON:
#   {"architecture": [ {"type": "Linear", "in_features": 3, "out_features": 16}, {"type": "ReLU"}, ... ],
#    "weights": "<base64 of the float32 (little-endian) parameters in state_dict order>",
#    "features": [[f_1, ..., f_a], ...]}            one row per test photo
# The network gets [Q, f_1, ..., f_a] (Q is added here, hidden from students) and must output
# (c_A, c_B, c_C). Rules: only Linear/LayerNorm/ReLU/ELU/Mish/Tanh, first layer Linear,
# at most 2000 parameters, last Linear with 3 outputs.
# Score_i = mean_k max(0, 1 - 5|c_k - c_hat_k| / (sqrt(c_k) + 1)); Score = mu(a) * mean_i Score_i;
# points = min(100, 152 * Score): 100 is the best fair reference solution found (colour features
# + a small network, tests/fair_model.py: Score 0.661 on testB); the contest used 110 * Score.
# Plain Python (the network is tiny); the contest ran it in float32 PyTorch, so results can differ
# in the last decimals.
LEVEL_FILES = {"testA": "testA.csv", "testB": "testB.csv"}
LEVEL_SIZES = {"testA": 160, "testB": 240}
MAX_PARAMS = 2000
ALLOWED = ("Linear", "LayerNorm", "ReLU", "ELU", "Mish", "Tanh")


def mu(a):
    if 0 <= a <= 2:
        return 1.0
    elif 2 < a <= 4:
        return -0.1 * (a - 2) + 1
    elif 4 < a <= 20:
        return -0.01 * (a - 4) + 0.8
    elif 20 < a <= 276:
        return -0.0025 * (a - 20) + 0.64
    return 0.0


def build_model(answer):
    """Validates the architecture and unpacks the weights. Returns (layers, a, n_params)."""
    if not isinstance(answer, dict):
        raise ValueError("the answer must be an object with architecture, weights and features")
    arch = answer.get("architecture")
    if isinstance(arch, str):
        arch = json.loads(arch)
    if not isinstance(arch, list) or not arch:
        raise ValueError("architecture must be a non-empty list of layers")
    for i, layer in enumerate(arch):
        if not isinstance(layer, dict) or layer.get("type") not in ALLOWED:
            raise ValueError(f"layer {i}: type '{layer.get('type') if isinstance(layer, dict) else layer}' is not allowed")
    if arch[0]["type"] != "Linear":
        raise ValueError(f"first layer must be Linear, got '{arch[0]['type']}'")

    sizes = []
    for i, layer in enumerate(arch):
        if layer["type"] == "Linear":
            n_in, n_out = int(layer["in_features"]), int(layer["out_features"])
            if n_in < 1 or n_out < 1:
                raise ValueError(f"layer {i}: invalid Linear sizes")
            sizes.append(n_in * n_out + n_out)
        elif layer["type"] == "LayerNorm":
            n = int(layer["normalized_shape"])
            if n < 1:
                raise ValueError(f"layer {i}: invalid LayerNorm size")
            sizes.append(2 * n)
        else:
            sizes.append(0)
    n_params = sum(sizes)
    if n_params > MAX_PARAMS:
        raise ValueError(f"too many parameters: {n_params} > {MAX_PARAMS}")
    last_linear = [l for l in arch if l["type"] == "Linear"][-1]
    if int(last_linear["out_features"]) != 3:
        raise ValueError(f"last Linear layer outputs {last_linear['out_features']}, expected 3")

    try:
        raw = base64.b64decode(answer.get("weights", ""), validate=True)
    except Exception:
        raise ValueError("weights are not valid base64")
    if len(raw) != 4 * n_params:
        raise ValueError(f"weights contain {len(raw) // 4} values, the architecture needs {n_params}")
    w = struct.unpack(f"<{n_params}f", raw)
    if not all(math.isfinite(v) for v in w):
        raise ValueError("weights contain NaN or Inf values")

    layers, off = [], 0
    for layer, size in zip(arch, sizes):
        params = w[off:off + size]
        off += size
        if layer["type"] == "Linear":
            n_in, n_out = int(layer["in_features"]), int(layer["out_features"])
            W = [params[j * n_in:(j + 1) * n_in] for j in range(n_out)]
            layers.append(("Linear", W, params[n_in * n_out:]))
        elif layer["type"] == "LayerNorm":
            n = int(layer["normalized_shape"])
            layers.append(("LayerNorm", params[:n], params[n:]))
        else:
            layers.append((layer["type"], None, None))
    return layers, int(arch[0]["in_features"]) - 1, n_params


def forward(layers, x):
    for i, (kind, a, b) in enumerate(layers):
        if kind == "Linear":
            if len(x) != len(a[0]):
                raise ValueError(f"layer {i}: expects {len(a[0])} inputs, got {len(x)}")
            x = [bj + sum(wk * xk for wk, xk in zip(row, x)) for row, bj in zip(a, b)]
        elif kind == "LayerNorm":
            if len(x) != len(a):
                raise ValueError(f"layer {i}: LayerNorm({len(a)}) got {len(x)} values")
            m = sum(x) / len(x)
            v = sum((t - m) ** 2 for t in x) / len(x)
            x = [(t - m) / math.sqrt(v + 1e-5) * g + h for t, g, h in zip(x, a, b)]
        elif kind == "ReLU":
            x = [t if t > 0 else 0.0 for t in x]
        elif kind == "ELU":
            x = [t if t > 0 else math.expm1(t) for t in x]
        elif kind == "Tanh":
            x = [math.tanh(t) for t in x]
        elif kind == "Mish":
            x = [t * math.tanh(math.log1p(math.exp(-abs(t))) + max(t, 0.0)) for t in x]
    if len(x) != 3:
        raise ValueError(f"the network outputs {len(x)} values, expected 3")
    return x


def evaluate(level_id, answer):
    if level_id not in LEVEL_FILES:
        print(f"Unknown level {level_id}")
        return 0
    has_truth = os.path.exists(LEVEL_FILES[level_id])
    n_rows = LEVEL_SIZES[level_id]
    try:
        layers, a, n_params = build_model(answer)
        feats = answer.get("features")
        if not isinstance(feats, list) or len(feats) != n_rows:
            raise ValueError(f"features must have {n_rows} rows (one per photo), got "
                             f"{len(feats) if isinstance(feats, list) else type(feats).__name__}")
        for i, row in enumerate(feats):
            if not isinstance(row, list) or len(row) != a:
                raise ValueError(f"features row {i} must have {a} values (the first layer takes 1 + {a} inputs)")
            if not all(isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) for v in row):
                raise ValueError(f"features row {i} contains NaN, Inf or non-numbers")
    except (ValueError, KeyError, TypeError) as e:
        print(f"[!] Invalid submission: {e}")
        return 0 if has_truth else -1

    summary = f"{n_params} parameters, a = {a} features, mu(a) = {mu(a):.2f}"
    if not has_truth:
        print(f"{level_id}: valid model ({summary}). This level is graded after the contest.")
        return -1

    with open(LEVEL_FILES[level_id], newline="") as f:
        truth = [[float(v) for v in r] for r in list(csv.reader(f))[1:] if r]
    try:
        total, per = 0.0, [0.0, 0.0, 0.0]
        for (q, *c_true), row in zip(truth, feats):
            pred = forward(layers, [q] + [float(v) for v in row])
            if not all(math.isfinite(v) for v in pred):
                raise ValueError("the model produced NaN or Inf predictions")
            for k in range(3):
                s = max(0.0, 1.0 - 5.0 * abs(c_true[k] - pred[k]) / (math.sqrt(c_true[k]) + 1))
                per[k] += s
                total += s / 3
    except ValueError as e:
        print(f"[!] Invalid submission: {e}")
        return 0
    n = len(truth)
    score = mu(a) * total / n
    points = round(min(100.0, 152 * score), 2)
    print(f"{level_id}: {summary}")
    print(f"mean Score_i per compound: A {per[0] / n:.3f}, B {per[1] / n:.3f}, C {per[2] / n:.3f}")
    print(f"Score = {score:.4f} -> {points} points")
    return points
`;export{e as default};
