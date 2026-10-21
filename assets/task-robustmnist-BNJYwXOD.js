const n=`import base64
import os

import numpy as np

# The answer is the trained network itself: {"weights": "<base64 of float32 little-endian values>"},
# the state_dict of the fixed SmallMNISTCNN in order:
#   conv1.weight (8,1,5,5), conv1.bias (8), conv2.weight (16,8,5,5), conv2.bias (16),
#   fc.weight (10,784), fc.bias (10)                                  -> 11,274 parameters
# (smaller than the contest's FixedMNISTCNN, so that the weights fit in a submission).
#
# Grading attacks the model: for every test digit the grader runs a white-box PGD attack
# (L_inf, eps = 0.3, pixels kept in [0, 1]) on the clean original, and also uses the contest's
# own perturbed version. A digit counts as correct only if the model classifies both correctly.
# Score: 0 at 15% accuracy, 100 at 66% or more, linear in between. 66% is the robust accuracy of the
# best fair reference solution (adversarial training, tests/adversarial_training.py) on the private
# set; the contest used min(100, max((accuracy - 0.15) * 135, 0)), 100 at 89%.
SHAPES = [("conv1.weight", (8, 1, 5, 5)), ("conv1.bias", (8,)),
          ("conv2.weight", (16, 8, 5, 5)), ("conv2.bias", (16,)),
          ("fc.weight", (10, 784)), ("fc.bias", (10,))]
N_PARAMS = sum(int(np.prod(s)) for _, s in SHAPES)
EPS, STEPS, ALPHA = 0.3, 20, 0.03


def score_from_accuracy(acc):
    return round(min(100.0, max((acc - 0.15) / (0.66 - 0.15) * 100.0, 0.0)), 2)


def load_weights(answer):
    if not isinstance(answer, dict) or not isinstance(answer.get("weights"), str):
        raise ValueError('the answer must be {"weights": "<base64>"}')
    try:
        raw = base64.b64decode(answer["weights"], validate=True)
    except Exception:
        raise ValueError("weights are not valid base64")
    if len(raw) != 4 * N_PARAMS:
        raise ValueError(f"weights contain {len(raw) // 4} values, SmallMNISTCNN has {N_PARAMS}")
    flat = np.frombuffer(raw, dtype="<f4").astype(np.float64)
    if not np.all(np.isfinite(flat)):
        raise ValueError("weights contain NaN or Inf values")
    params, off = {}, 0
    for name, shape in SHAPES:
        size = int(np.prod(shape))
        params[name] = flat[off:off + size].reshape(shape)
        off += size
    return params


def _im2col(x, k=5, pad=2):
    """x (N,C,H,W) -> columns (N*H*W, C*k*k) for a 'same' convolution."""
    n, c, h, w = x.shape
    xp = np.pad(x, ((0, 0), (0, 0), (pad, pad), (pad, pad)))
    win = np.lib.stride_tricks.sliding_window_view(xp, (k, k), axis=(2, 3))  # N,C,H,W,k,k
    return win.transpose(0, 2, 3, 1, 4, 5).reshape(n * h * w, c * k * k)


def _col2im(cols, shape, k=5, pad=2):
    """Adjoint of _im2col: cols (N*H*W, C*k*k) -> gradient w.r.t. x (N,C,H,W)."""
    n, c, h, w = shape
    cols = cols.reshape(n, h, w, c, k, k)
    out = np.zeros((n, c, h + 2 * pad, w + 2 * pad))
    for i in range(k):
        for j in range(k):
            out[:, :, i:i + h, j:j + w] += cols[:, :, :, :, i, j].transpose(0, 3, 1, 2)
    return out[:, :, pad:pad + h, pad:pad + w]


def _conv(x, w, b):
    n, _, h, wd = x.shape
    cols = _im2col(x)
    z = cols @ w.reshape(w.shape[0], -1).T + b
    return z.reshape(n, h, wd, -1).transpose(0, 3, 1, 2)


def _pool(a):
    """2x2 max-pool. Ties go to the first maximum in row-major order, as in PyTorch
    (MNIST's flat background makes ties common, and they change the gradient)."""
    n, c, h, w = a.shape
    blocks = a.reshape(n, c, h // 2, 2, w // 2, 2).transpose(0, 1, 2, 4, 3, 5).reshape(n, c, h // 2, w // 2, 4)
    idx = blocks.argmax(axis=-1)
    p = np.take_along_axis(blocks, idx[..., None], axis=-1)[..., 0]
    return p, idx


def _unpool(g, idx):
    n, c, h, w = g.shape
    out = np.zeros((n, c, h, w, 4))
    np.put_along_axis(out, idx[..., None], g[..., None], axis=-1)
    return out.reshape(n, c, h, w, 2, 2).transpose(0, 1, 2, 4, 3, 5).reshape(n, c, 2 * h, 2 * w)


def forward(p, x, keep=False):
    z1 = _conv(x, p["conv1.weight"], p["conv1.bias"])
    a1 = np.maximum(z1, 0)
    h1, m1 = _pool(a1)
    z2 = _conv(h1, p["conv2.weight"], p["conv2.bias"])
    a2 = np.maximum(z2, 0)
    h2, m2 = _pool(a2)
    logits = h2.reshape(len(x), -1) @ p["fc.weight"].T + p["fc.bias"]
    return (logits, (z1, m1, h1, z2, m2)) if keep else logits


def input_gradient(p, x, y):
    """Gradient of the summed cross-entropy loss w.r.t. the input images."""
    logits, (z1, m1, h1, z2, m2) = forward(p, x, keep=True)
    e = np.exp(logits - logits.max(axis=1, keepdims=True))
    g = e / e.sum(axis=1, keepdims=True)
    g[np.arange(len(y)), y] -= 1
    g = (g @ p["fc.weight"]).reshape(len(x), 16, 7, 7)
    g = _unpool(g, m2) * (z2 > 0)
    g = g.transpose(0, 2, 3, 1).reshape(-1, 16) @ p["conv2.weight"].reshape(16, -1)
    g = _col2im(g, h1.shape)
    g = _unpool(g, m1) * (z1 > 0)
    g = g.transpose(0, 2, 3, 1).reshape(-1, 8) @ p["conv1.weight"].reshape(8, -1)
    return _col2im(g, x.shape)


def pgd(p, x, y):
    xa = x.copy()
    for _ in range(STEPS):
        xa = xa + ALPHA * np.sign(input_gradient(p, xa, y))
        xa = np.clip(np.clip(xa, x - EPS, x + EPS), 0.0, 1.0)
    return xa


def _load_level(level_id):
    folder = "." if os.path.exists(f"{level_id}_labels.txt") else None
    if folder is None:
        return None
    with open(f"{level_id}_labels.txt") as f:
        labels = np.array([int(c) for c in f.read().strip()])
    clean = np.load(f"{level_id}_clean.npy").astype(np.float64)[:, None] / 255.0
    adv = np.load(f"{level_id}_adv.npy").astype(np.float64)[:, None] / 255.0
    return labels, clean, adv


def evaluate(level_id, answer):
    if level_id not in ("public", "private"):
        print(f"Unknown level: {level_id}")
        return 0
    data = _load_level(level_id)
    try:
        params = load_weights(answer)
    except ValueError as e:
        print(f"[!] Invalid submission: {e}")
        return 0 if data is not None else -1
    if data is None:
        print("Valid SmallMNISTCNN weights. The private level is graded after the contest.")
        return -1

    labels, clean, adv = data
    ok_clean = forward(params, clean).argmax(1) == labels
    ok_contest = forward(params, adv).argmax(1) == labels
    ok_pgd = forward(params, pgd(params, clean, labels)).argmax(1) == labels
    robust = ok_contest & ok_pgd
    acc = float(robust.mean())
    score = score_from_accuracy(acc)
    print(f"clean accuracy {ok_clean.mean():.1%} | contest adversarial images {ok_contest.mean():.1%} | "
          f"PGD-{STEPS} (eps {EPS}) {ok_pgd.mean():.1%}")
    print(f"robust accuracy (both attacks) {acc:.1%} -> {score}")
    return score
`;export{n as default};
