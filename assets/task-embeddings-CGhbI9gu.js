const n=`import os
import numpy as np
import json

levels = {
    'basic': {'words': 'αλυσίδα-λέξη', 'target': 4},
    'easy': {'words': 'σύμπαν-φιλοξενώ', 'target': 5},
    'medium': {'words': 'ανεργία-τηγάνι', 'target': 5},
    'hard': {'words': 'πορώδης-παραπέμπω', 'target': 5},
}


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

word_to_index = {word: i for i, word in enumerate(words)} if words else {}
print('word_to_index', len(word_to_index))  

def similarity(i, j):
    return np.dot(embeddings[i], embeddings[j]) / (np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j]))

def calculate_distance(i, j):
    sim = similarity(i, j)
    if sim >= 0.5: return 1 # σκούρα γραμμή
    if sim >= 0.4: return 2 # αχνή γραμμή
    if sim >= 0.3: return 3 # διακεκομμένη γραμμή
    return float('inf')

def dijkstra_shortest_path(adjacency_matrix, source, target):
    """Find shortest path using Dijkstra's algorithm"""
    n = len(adjacency_matrix)
    distances = [float('inf')] * n
    distances[source] = 0
    visited = [False] * n
    previous = [-1] * n
    
    for _ in range(n):
        # Find unvisited node with minimum distance
        min_dist = float('inf')
        u = -1
        for i in range(n):
            if not visited[i] and distances[i] < min_dist:
                min_dist = distances[i]
                u = i
        
        if u == -1 or u == target:
            break
            
        visited[u] = True
        
        # Update distances to neighbors
        for v in range(n):
            if not visited[v] and adjacency_matrix[u][v] > 0:
                alt = distances[u] + adjacency_matrix[u][v]
                if alt < distances[v]:
                    distances[v] = alt
                    previous[v] = u
    
    # Reconstruct path
    if distances[target] == float('inf'):
        return None, float('inf')
    
    path = []
    current = target
    while current != -1:
        path.append(current)
        current = previous[current]
    path.reverse()
    
    return path, distances[target]

def evaluate(levelId, answer):
    given_words = answer.split('-')
    level_data = levels[levelId]
    level_words = level_data['words'].split('-')
    target = level_data['target']
    
    print('level_words', level_words)
    if len(level_words) >= 2:
        source_word, target_word = level_words[0], level_words[1]
        print('source_word', source_word)
        print('target_word', target_word)
    else:
        print(f"Invalid level format: {level}")

    source_idx = word_to_index.get(source_word)
    target_idx = word_to_index.get(target_word)
    if source_idx is None or target_idx is None:
        print("Word not found")
        return 0
    
    # Create adjacency matrix
    n = len(given_words)
    adjacency_matrix = [[0] * n for _ in range(n)]
    for i, w1 in enumerate(given_words):
        for j, w2 in enumerate(given_words):
            if w1 == w2: continue
            idx1, idx2 = word_to_index.get(w1), word_to_index.get(w2)

            if idx1 is None or idx2 is None:
                continue
            adjacency_matrix[i][j] = calculate_distance(idx1, idx2)
            

    # Find shortest path
    path, distance = dijkstra_shortest_path(adjacency_matrix, 0, 1)
    
    if path is None:
        print("Δεν ενώθηκαν")
        return 0
    
    if distance == float('inf'):
        print("Δεν ενώθηκαν")
        return 0
    if target == 4 and distance > 4: return 0
    if distance == target:
        return 100
    elif distance == target + 1:
        return 80
    elif distance == target + 2:
        return 50
    elif distance > target + 2:
        return 10
    return 0
`;export{n as default};
