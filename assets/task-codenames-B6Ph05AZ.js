const n=`import os
import numpy as np
import json

def load_embeddings(filename="embeddings.npz"):
    # The words and their vectors; the vectors are stored as whole numbers ×10000 (the values
    # have 4 decimals), which loads far faster than parsing a CSV.
    try:
        if not os.path.exists(filename):
            print(f"Embeddings not found at {filename}")
            return None, None

        data = np.load(filename)
        words = data['words'].tolist()
        embeddings = data['vectors'] / 10000
        embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)
        return words, np.array(embeddings)
    except Exception as e:
        print(f"Error loading embeddings: {e}")
        return None, None

# Load embeddings from the task directory
words, embeddings = load_embeddings("embeddings.npz")

if words is None: 
    print("Not found")
else: 
    word_to_index = {word: i for i, word in enumerate(words)} if words else {}

tasks = {
    "basic": [  # 3x4
        ('μήλο', 1),    ('σκύλος', 0),  ('αυτοκίνητο', 0),  ('γάτα', 0),
        ('βιβλίο', 0),  ('δάσος', 1),   ('ποδόσφαιρο', 0),  ('τραπέζι', 0),
        ('χειμώνας', 0),('καρότο', 1),  ('πλαζ', 0),        ('βουνό', 1)
    ],
    "easy1": [  # 5x5
        ("έστω", 0),      ("αμάχη", 0),     ("αφράτος", 1),   ("βάραθρο", 1),   ("βιδέλο", 0),
        ("γέρασμα", 0),   ("διαπάλη", 0),   ("εγγύς", 1),     ("ενδημία", 0),   ("ερύθημα", 1),
        ("ευθύνη", 0),    ("κίρρωση", 1),   ("κιλότο", 0),    ("κονάκι", 0),    ("κυρούλα", 1),
        ("μαμά", 0),      ("μπαμπάς", 1),   ("μόνιμος", 1),   ("νότος", 1),     ("οπάλι", 0),
        ("οπαλίνα", 1),   ("ορίζω", 1),     ("πετώ", 0),      ("τάδες", 1),     ("φραπές", 0)
    ],
    "easy2": [  # 5x5
        ("αγώνας", 0),    ("ανεβάζω", 1),   ("απωθώ", 0),    ("αφράτος", 0),   ("βίδα", 1),
        ("γίδα", 1),      ("γεράνι", 1),    ("δηνάριο", 0),  ("καίσαρ", 1),    ("καρσί", 1),
        ("κατιμάς", 1),   ("καφέ", 0),      ("κόλλυβο", 0),  ("λέρα", 0),      ("μονιμάς", 0),
        ("μορς", 1),      ("μοτέρ", 1),     ("μποφόρ", 0),   ("ομού", 0),      ("ορφικός", 0),
        ("παράγω", 1),    ("σήραγγα", 1),   ("σεισμός", 1),  ("υπατεία", 1),   ("ωστόσο", 0)
    ],
    "hard1": [  # 6x6
        ("Παναμάς", 1),   ("άζυμος", 1),    ("άλλοθι", 1),   ("άμπελος", 1),   ("άχρονος", 0),   ("έθιμο", 0),
        ("ακοή", 0),      ("γαρμπής", 0),   ("δέων", 1),     ("δούλεψη", 0),   ("επίπεδο", 0),   ("θάρρος", 0),
        ("κάποιος", 0),   ("καλπάζω", 1),   ("καφέ", 0),     ("λόχος", 1),     ("μαυρίζω", 0),   ("μπράιγ", 1),
        ("μόρβα", 1),     ("νυχτικό", 0),   ("ορμόνη", 1),   ("περάτης", 1),   ("πλάστης", 1),   ("πρόταση", 0),
        ("ριζά", 1),      ("σάρκωμα", 0),   ("σαλτάρω", 0),  ("συστάδα", 1),   ("σχόλιο", 1),    ("ταβέρνα", 1),
        ("ταχύς", 0),     ("τορπίλη", 0),   ("τούντρα", 0),  ("φυτό", 0),      ("χρωστώ", 1),    ("ώμος", 1)
    ],
    "hard2": [  # 6x6
        ("ακαθισία", 1),   ("αναδιανομή", 0),   ("γονυκλινής", 1), ("γουναρικό", 0),       ("δεξίωση", 1),        ("δωρεοδόχος", 1),
        ("είναι", 0),      ("επιεικής", 0),     ("θεματικός", 1),  ("κατοστάρικο", 0),     ("κοίλανση", 0),       ("κτίση", 1),
        ("λευκόχρυσος", 1),("ναυς", 0),         ("ομιλητική", 0),  ("οργανωτής", 1),       ("πάτρονας", 1),       ("πέραμα", 1),
        ("παράθεμα", 1),   ("παρουσιαστικό", 0),("πεντάγραμμο", 0),("πλατωνιστής", 0),     ("πλιατσικολόγος", 1), ("ραδιοαστρονομία", 1),
        ("σαλβάρι", 1),    ("σκάφος", 0),       ("σκωρίαση", 0),   ("στρουθοκαμηλισμός",0),("σφουγγαρίστρα", 0),  ("τάισμα", 0),
        ("υαλοστάσιο", 0), ("υδρωπικία", 0),    ("χαρούπι", 1),    ("χιλιετία", 1),        ("χρησικτησία", 1),    ("ψυχογλωσσολογία", 1)
    ]
}

opt = {
    "basic": 1,
    "easy1": 2,
    "easy2": 2,
    "hard1": 4,
    "hard2": 3
}

def evaluate(taskId, hints):
    if words is None:
        print("Embeddings not available, returning 0")
        return 0
    task = tasks[taskId]
    ids = [word_to_index.get(w, -1) for w, _ in task]
    if -1 in ids:
        return 0
        
    good = [i for i, (w, g) in enumerate(task) if g == 1]
    covered = []
    emb = embeddings[ids]
    
    for i, hint in enumerate(hints):
        try:
            w, n = hint
        except ValueError as e:
            print(f"Error unpacking hint {hint}: {e}")
            return 0
            
        if w not in word_to_index:
            print(f"Word '{w}' not found in word_to_index")
            return 0
        s = emb @ embeddings[word_to_index[w]]
        closest = s.argsort()[::-1]
        cnt = 0
        for i in closest:
            if i in covered: continue
            cnt += 1
            if i not in good: 
                print('The bad word', task[i][0], 'was covered by hint',w)
                return 0
            covered.append(i)
            if cnt == n: 
                break
        if cnt < n:
            print('The hint',w,'covers more words than available')
            return 0
    if len(covered) < len(good): 
        missing_ids = set(good).difference(covered)
        missing = [task[i][0] for i in missing_ids]
        print('Not all good words are covered.')
        print('Missing:', missing )
        return 0
    
    t = len(hints)
    if t == opt[taskId]: 
        score = 100
        task_detail = f"Perfect! Used {t} hints (optimal: {opt[taskId]})"
    elif t == opt[taskId] + 1: 
        score = 70
        task_detail = f"Good! Used {t} hints (optimal: {opt[taskId]})"
    elif t == opt[taskId] + 2: 
        score = 40
        task_detail = f"Fair. Used {t} hints (optimal: {opt[taskId]})"
    else: 
        score = max(0, round(15 / (t - opt[taskId] - 2)))
        task_detail = f"Used {t} hints (optimal: {opt[taskId]})"
    if taskId == "basic" and t != 1: 
        score = 0
        task_detail = "Basic level must use exactly 1 hint"
    print(task_detail)
    return score`;export{n as default};
