const e=`import os
import numpy as np

def read_answers(filename="answer.csv"):
    with open(filename,"r") as f:
        return np.array( [int(l.strip()) for l in f] )

y_test = read_answers("labels_public.csv")
# The hidden labels of the other half (private/, -1 = public review); absent unless released.
y_private = read_answers("labels_private.csv") if os.path.exists("labels_private.csv") else None

def evaluate_full(y_test, y_pred):
    err = np.abs(y_test - y_pred)[ y_test > 0 ].mean()
    score = round( min( 110 * max(1.5-err,0), 100) )
    print("full (public):",score,err)
    return score

def evaluate_easy(y_test, y_pred):
    print(len(y_test), len(y_pred))
    err = np.abs(y_test - y_pred)[ (y_test == 1) | (y_test == 5) ]
    
    acc = np.zeros(len(err))
    acc[ err < 2 ] = 1
    acc[ err == 2 ] = 0.5
    acc[ err > 2 ] = 0

    score = round( max(min(2 * (acc.mean() - 0.5) * 120,100),0) )
    print("easy (public):",score, acc.mean())
    return score
    
def evaluate(levelId, answer):
    a = np.array( [int(l.strip()) if l != '-' else -1 for l in answer] )
    if levelId == 'public-easy':
        b = y_test[ (y_test == 1)|(y_test == 5) ]
        return evaluate_easy(b, a)

    if levelId == 'public-hard':
        b = y_test[ (y_test > 1)&(y_test < 5) ]
        return evaluate_full(b, a)

    if levelId == 'private':
        if y_private is None:
            return -1
        b = y_private[y_test == -1]  # the private reviews, in file order
        if len(a) != len(b) or a.min() < 1 or a.max() > 5:
            print("Οι τιμές πρέπει να είναι στο διάστημα [1,5]")
            return 0
        return evaluate_private(b, a)
    return -1

# The contest's private score (its grader, problem_files/skroutzreviews/grader.py):
# 0.2 x easy + 0.8 x full, with a stricter full scale than the public levels.
def evaluate_private(y_test, y_pred):
    err = np.abs(y_test - y_pred).mean()
    full = round( min( 180 * max(1-err,0), 100) )
    err = np.abs(y_test - y_pred)[ (y_test == 1) | (y_test == 5) ]
    acc = np.zeros(len(err))
    acc[ err < 2 ] = 1
    acc[ err == 2 ] = 0.5
    acc[ err > 2 ] = 0
    easy = round( max(min(2 * (acc.mean() - 0.5) * 120,100),0) )
    print("private: full", full, "easy", easy)
    return round(0.2 * easy + 0.8 * full)
`;export{e as default};
