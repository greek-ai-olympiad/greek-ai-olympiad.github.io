const e=`import numpy as np
import json
import pandas as pd
import os

# -----------------------------------------------------------
# Load test metadata
# -----------------------------------------------------------
with open("test_data.json", "r") as f:
    test_data = json.load(f)

true_tree = None
if os.path.exists("true_tree.json"):
    with open("true_tree.json", "r") as f:
        true_tree = json.load(f)

# Tree leaf constant (matches scikit-learn)
TREE_LEAF = -2

def tree_intersect(ranges, tree_arrays):
    if not tree_arrays or not isinstance(tree_arrays, dict):
        return []
    
    children_left = tree_arrays.get("children_left", [])
    children_right = tree_arrays.get("children_right", [])
    threshold = tree_arrays.get("threshold", [])
    feature = tree_arrays.get("feature", [])
    label = tree_arrays.get("label", [])

    def tree_intersect_inner(index, ranges):
        if index < 0:
            return 0            
        if children_left[index] < 0 and children_right[index] < 0:
            return [ (ranges, label[index]) ]
        
        feat_idx = feature[index]
        thresh = threshold[index]

        results = []
        
        if ranges[feat_idx][0] < thresh:
            new_ranges = ranges.copy()
            new_ranges[feat_idx] = (ranges[feat_idx][0], min(thresh, ranges[feat_idx][1]))
            results.extend(tree_intersect_inner(children_left[index], new_ranges))
        if ranges[feat_idx][1] > thresh:
            new_ranges = ranges.copy()
            new_ranges[feat_idx] = (max(thresh, ranges[feat_idx][0]), ranges[feat_idx][1])
            results.extend(tree_intersect_inner(children_right[index], new_ranges))

        return results
    return tree_intersect_inner(0, ranges)

def predict_from_tree(X, tree_arrays):
    if not tree_arrays or not isinstance(tree_arrays, dict):
        return 0
    
    children_left = tree_arrays.get("children_left", [])
    children_right = tree_arrays.get("children_right", [])
    threshold = tree_arrays.get("threshold", [])
    feature = tree_arrays.get("feature", [])
    label = tree_arrays.get("label", [])
    
    if not children_left or len(children_left) == 0:
        return 0
    
    # Start at root (node 0)
    node_id = 0
    
    while True:
        # Check if current node is a leaf (-2 is scikit-learn format, -1 is our format)
        left_child = children_left[node_id] if node_id < len(children_left) else TREE_LEAF
        right_child = children_right[node_id] if node_id < len(children_right) else TREE_LEAF
        if (left_child < 0) and (right_child < 0):
            return int(label[node_id]) if node_id < len(label) and label[node_id] >= 0 else 0
        
        # Get feature index and threshold
        feat_idx = feature[node_id] if node_id < len(feature) else -2
        thresh = threshold[node_id] if node_id < len(threshold) else 0
        
        if feat_idx < 0 or feat_idx >= len(X):
            return 0
        
        # Get feature value
        feat_value = X[feat_idx]
        
        if feat_value is None:
            return 0
        
        # Traverse left or right
        if feat_value <= thresh:
            next_id = children_left[node_id] if node_id < len(children_left) else TREE_LEAF
        else:
            next_id = children_right[node_id] if node_id < len(children_right) else TREE_LEAF
        
        if next_id < 0:
            return 0
        
        node_id = next_id


def evaluate(level_id, answer):
    """
    Evaluates student's decision tree against true labels.
    Accepts tree format: {children_left, children_right, threshold, feature, label}
    Returns a score based on closeness to ideal accuracy.
    """

    if level_id not in test_data:
        print(f"Level '{level_id}' not found in test_data.json.")
        return 0

    examples = test_data[level_id]
    # Validate tree format
    if not isinstance(answer, dict):
        print("Invalid answer format: expected dictionary with tree arrays.")
        return 0
    
    required_keys = ["children_left", "children_right", "threshold", "feature", "label"]
    if not all(key in answer for key in required_keys):
        print(f"Invalid tree format: missing required keys. Expected: {required_keys}")
        return 0
    
    if not examples or len(examples) == 0:
        print("No examples found in test data.")
        return 0
    
    if true_tree is None:
        # Calculate accuracy based on examples
        correct = []
        for i,X,y in examples:
            pred = predict_from_tree(X, answer)
            correct.append(pred == y)
        accuracy = np.mean(correct)
    else:
        # Calculate accuracy based on tree intersection
        noise_rate = 0.05
        all_ranges = [ (0, 30), (0, 1), (4, 10), (0, 1), (0, 1) ]
        results = tree_intersect(all_ranges, answer)
        accuracy = 0
        for ranges, pred in results:
            true_labels = tree_intersect(ranges, true_tree[level_id])
            for true_ranges, true_label in true_labels:
                if true_label != pred: continue
                volume = 1
                for t,r in zip(true_ranges, all_ranges):
                    volume *= (t[1] - t[0])  / (r[1] - r[0])
                accuracy += volume * (1 - noise_rate)

    IDEAL = {
        "easy": 0.92,
        "hard": 0.92
    }

    ideal_acc = IDEAL[level_id]
    minimum_acc = 0.6
    print(f"Accuracy: {accuracy:.3f}, Ideal: {ideal_acc:.3f}, Minimum: {minimum_acc:.3f}")
    
    score_ex = (accuracy - minimum_acc) / (ideal_acc - minimum_acc)

    score_ex = max(0, score_ex)
    score_ex = min(1, score_ex)

    return round( (score_ex**2) * 100)

`;export{e as default};
