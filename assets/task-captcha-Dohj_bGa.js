const e=`import os
def evaluate(level_id, answer):
    if not os.path.exists(f'{level_id.replace("-", "_")}.txt'):
        return -1
    with open(f'{level_id.replace("-", "_")}.txt', 'r') as f:
        targets = f.readlines()
    answers = answer.split('\\n')
    correct = 0
    partial_correct = 0
    for a, t in zip(answers, targets):
        a = a.strip()
        t = t.strip()
        try:
            a_eq,a_result = a.split('=')
            t_eq,t_result = t.split('=')
            if a_eq == t_eq:
                correct += 1 if a_result.strip() == t_result.strip() else 0
            else:
                if len(a_eq) != len(t_eq): continue
                chars_correct = sum(1 for ac, tc in zip(a_eq, t_eq) if ac == tc)
                partial_correct += 1 if chars_correct >= len(a_eq)-1 else 0
        except:
            continue
    print(correct, '/', len(targets))
    accuracy = correct / len(targets)
    if 'clean' in level_id:
        if correct >= len(targets) * 0.95: return 100
        elif correct >= len(targets) * 0.8: return round(50 + (accuracy-0.8) / 0.15 * 50 )
        else: return round( (accuracy / 0.8) * 50 )
    else:
        return max(0, min(100, round( (accuracy-0.05) / 0.9 * 100 )))
`;export{e as default};
