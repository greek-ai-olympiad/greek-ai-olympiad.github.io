const n=`import numpy as np
import math
import types
from PIL import Image
import os
import sys

# Maximum constraints
MAX_LAYERS = 12
MAX_NODES_PER_LAYER = 20

def forward_numpy_layers(xy_coords, layers):
    """
    Forward pass through neural network using layers format.
    layers: list of dicts with 'weights' and 'bias' keys
    """
    # Start with input coordinates
    out = np.array(xy_coords)  # Shape: (N, 2)
    
    # Process each layer
    for layer_idx, layer in enumerate(layers):
        weights = np.array(layer['weights'])  # Shape: (num_nodes, num_inputs)
        bias = np.array(layer['bias'])  # Shape: (num_nodes,)
        
        # Ensure input size matches
        num_inputs = out.shape[1]
        num_nodes, expected_inputs = weights.shape
        
        if expected_inputs != num_inputs:
            # Pad or truncate input to match expected size
            if expected_inputs > num_inputs:
                # Pad with zeros
                padded_out = np.zeros((len(xy_coords), expected_inputs), dtype=float)
                padded_out[:, :num_inputs] = out
                out = padded_out
            else:
                # Truncate
                out = out[:, :expected_inputs]
        
        # Matrix multiplication: output = input @ weights.T + bias
        # weights shape: (num_nodes, num_inputs)
        # out shape: (N, num_inputs)
        # output shape: (N, num_nodes)
        output = np.dot(out, weights.T) + bias
        
        # Apply ReLU activation (except for last layer)
        if layer_idx < len(layers) - 1:
            output = np.maximum(output, 0)
        
        out = output
    
    # Return RGB output (first 3 channels), clipped to [0, 1]
    return np.clip(out[:, :3], 0, 1)

def function2image_np(f, grid_size=500):
    x_vals = np.linspace(0, 1, grid_size)
    y_vals = np.linspace(0, 1, grid_size)
    X, Y = np.meshgrid(x_vals, y_vals, indexing='xy')

    X_flat = X.flatten()
    Y_flat = Y.flatten()

    if isinstance(f, types.FunctionType):
        output = np.array([f(x.item(), y.item()) for x, y in zip(X_flat, Y_flat)])
    elif isinstance(f, list):
        # f is a list of layers (JSON format)
        inp = np.column_stack((X_flat, Y_flat))
        output = forward_numpy_layers(inp, f)
    else:
        sys.stdout.write("Unsupported function\\n")
        sys.stdout.flush()
        return None

    return np.clip(output, 0, 1).reshape(-1, 3)

def basic_f(x, y):
    return (x, y, 0)

def easy_f(x, y):
    return (0, 0, abs(x + y - 1))

def medium_f(x, y):
    return ((math.sin(x * 15)) * 0.5 + 0.5, (math.cos(y * 15)) * 0.5 + 0.5, 0)

# Load images for advanced and hard levels
def load_advanced_image():
    # Try to find rubiks.jpg in requiredFiles or current directory
    paths = [
        os.path.join("requiredFiles", "rubiks.jpg"),
        "rubiks.jpg",
        os.path.join("..", "requiredFiles", "rubiks.jpg")
    ]
    for path in paths:
        if os.path.exists(path):
            return np.array(Image.open(path).convert("RGB")) / 255.0
    raise FileNotFoundError("Could not find rubiks.jpg")

def load_hard_image():
    # Try to find cat.jpg in requiredFiles or current directory
    paths = [
        os.path.join("requiredFiles", "cat.jpg"),
        "cat.jpg",
        os.path.join("..", "requiredFiles", "cat.jpg")
    ]
    for path in paths:
        if os.path.exists(path):
            return np.array(Image.open(path).convert("RGB")) / 255.0
    raise FileNotFoundError("Could not find cat.jpg")

advanced_img = None
hard_img = None

def advanced_f(x, y):
    global advanced_img
    if advanced_img is None:
        advanced_img = load_advanced_image()
    h, w = advanced_img.shape[0], advanced_img.shape[1]
    xi = min(math.floor(x * w), w - 1)
    yi = min(math.floor((1 - y) * h), h - 1)
    return advanced_img[yi, xi].tolist()

def hard_f(x, y):
    global hard_img
    if hard_img is None:
        hard_img = load_hard_image()
    h, w = hard_img.shape[0], hard_img.shape[1]
    xi = min(math.floor(x * w), w - 1)
    yi = min(math.floor((1 - y) * h), h - 1)
    return hard_img[yi, xi].tolist()

def evaluate_single(weights, f):
    output = function2image_np(weights)
    target = function2image_np(f)
    if output is None or target is None:
        return float('inf')
    return np.mean(np.abs(output - target)).item()

tasks = {
    "basic": {"f": basic_f, "base": 0.167, "points": 5},
    "easy": {"f": easy_f, "base": 0.065, "points": 15},
    "medium": {"f": medium_f, "base": 0.210, "points": 20},
    "advanced": {"f": advanced_f, "base": 0.327, "points": 30},
    "hard": {"f": hard_f, "base": 0.210, "points": 30}
}

def evaluate(levelId, answer):
    """
    Evaluate answer for a specific level.
    answer: dict with 'layers' key, or list of layers (already JSON decoded)
    """
    try:
        # Extract layers from answer
        if isinstance(answer, dict) and "layers" in answer:
            layers = answer["layers"]
        elif isinstance(answer, list):
            layers = answer
        else:
            return 0
        
        # Validate layers structure
        if not isinstance(layers, list) or len(layers) == 0:
            return 0
        
        # Check constraints
        if len(layers) > MAX_LAYERS:
            return 0
        
        for layer in layers:
            if not isinstance(layer, dict) or "weights" not in layer or "bias" not in layer:
                return 0
            if len(layer["weights"]) > MAX_NODES_PER_LAYER:
                return 0
            if len(layer["weights"]) != len(layer["bias"]):
                return 0
        
        # Evaluate against target function
        if levelId not in tasks:
            return 0
        
        err = evaluate_single(layers, tasks[levelId]["f"])
        score = 1 - err / (tasks[levelId]["base"] * 1.1)
        score = max(0, min(1, score))  # Clamp between 0 and 1
        
        # Print error and score to stdout
        sys.stdout.write(f"{levelId}: err={err:.3f}, score={score:.3f}\\n")
        sys.stdout.flush()
        
        # Convert to percentage
        return int(score * 100)
        
    except Exception as e:
        # Return 0 on any error
        sys.stdout.write(f"Error evaluating {levelId}: {e}\\n")
        sys.stdout.flush()
        return 0
`;export{n as default};
