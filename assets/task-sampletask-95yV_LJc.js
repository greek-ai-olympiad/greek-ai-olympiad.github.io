const e=`import numpy as np
import json

with open('test_data.json', 'r') as f:
    test_data = json.load(f)

def evaluate(level_id, answer):
    if level_id not in test_data:
        return 0
    
    level_data = test_data[level_id]
    labels = level_data['expected']
    
    if type(answer) != list or len(answer) != len(labels):
        print("Invalid answer")
        return 0
    
    accuracy = np.mean([1 if pred == label else 0 for pred, label in zip(answer, labels)])
    # Convert accuracy to score
    if accuracy > 0.95:
        return 100
    elif accuracy > 0.9:
        return 50
    elif accuracy > 0.8:
        return 25
    else:
        return 0


def generate(level_id):
    level_data = test_data[level_id]
    numbers = level_data['numbers']
    modulo = level_data['modulo']
    #ensure answer is a json primitive, not numpy
    return run(np.array(numbers), modulo).tolist()
`;export{e as default};
