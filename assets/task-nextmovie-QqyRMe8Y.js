const e=`import numpy as np
import json
import os

# Load movie embeddings
with open('movie_embeddings.json', 'r', encoding='utf-8') as f:
    movie_embeddings = np.array(json.load(f), dtype=np.float32)

# Load levels configuration
with open('levels.json', 'r', encoding='utf-8') as f:
    levels = json.load(f)

def evaluate(level_id, answer):
    """
    Evaluate the answer.
    answer should be a dict with 'query' (string) and 'embedding' (list of floats)
    """
    if level_id not in levels:
        return 0
    
    if not answer:
        return 0
    
    # Parse answer - could be a dict or JSON string
    if isinstance(answer, str):
        try:
            answer = json.loads(answer)
        except (json.JSONDecodeError, TypeError):
            return 0
    
    # Validate answer is a dict
    if not isinstance(answer, dict):
        return 0
    
    # Extract embedding from answer
    embedding = answer.get('embedding')
    
    # Validate embedding
    if not embedding or not isinstance(embedding, list):
        return 0
    
    # Validate embedding dimension (should be 384 for multilingual-e5-small)
    if len(embedding) != 384:
        return 0
    
    # Validate all elements are numbers
    try:
        query_embedding = np.array(embedding, dtype=np.float32)
    except (ValueError, TypeError):
        return 0

    # Cosine similarity: normalise the query too, so scaling it up cannot widen the gaps
    norm = np.linalg.norm(query_embedding)
    if not np.isfinite(norm) or norm == 0:
        return 0
    query_embedding = query_embedding / norm
    
    # Get level configuration
    level = levels[level_id]
    movie_indices = level
    
    # Get embeddings for movies in this level
    level_movie_embeddings = movie_embeddings[movie_indices]
    
    # Cosine similarities (dot product, since both sides are unit vectors)
    similarities = np.dot(level_movie_embeddings, query_embedding)
    
    # Sort movies by similarity (descending)
    # sorted_indices[i] gives the position in movie_indices for the i-th ranked movie
    sorted_indices = np.argsort(similarities)[::-1]
    
    # Get top 5 positions
    top_5_indices = sorted_indices[:5].tolist()
    
    # Target movies are indices 0, 1, 2, 3, 4 (first 5 movies in level)
    target_movies = list(range(5))
    
    # Calculate base score: 5 points per movie in top 5, 10 points per movie in correct position
    # If a movie is in top 5: 5 points
    # If it is also in correct position: 10 points (replaces the 5, so total is 10)
    base_score = 0.0
    for i, target_movie_idx in enumerate(target_movies):
        if target_movie_idx in top_5_indices:
            if top_5_indices[i] == target_movie_idx:
                base_score += 10.0  # Movie is in correct position
            else:
                base_score += 5.0  # Movie is in top 5 but wrong position
    
    # Maximum base score is 50 points (5 movies × 10 points for correct position)
    
    # Calculate bonus based on minimum score difference between consecutive movies
    # Only calculate bonus if all movies are in top 5 and in correct order
    all_in_top_5 = all(movie_idx in top_5_indices for movie_idx in target_movies)
    correct_order = all(top_5_indices[i] == target_movies[i] for i in range(5))
    
    bonus = 0.0
    if all_in_top_5 and correct_order:
        # Get similarities for the top 6 movies (to include 5th-6th difference)
        top_6_similarities = similarities[sorted_indices[:6]]
        
        # Calculate differences between consecutive movies (i-th and (i+1)-th)
        # For i from 0 to 4 (which corresponds to pairs: 1st-2nd, 2nd-3rd, 3rd-4th, 4th-5th, 5th-6th)
        differences = []
        for i in range(5):  # i = 0, 1, 2, 3, 4 (for pairs 1-2, 2-3, 3-4, 4-5, 5-6)
            diff = top_6_similarities[i] - top_6_similarities[i + 1]
            differences.append(diff)
        
        # Find minimum difference
        min_diff = min(differences) if differences else 0.000
        print('differences', [ "{:.3f}".format(diff) for diff in differences ])
        print('min_diff', "{:.3f}".format(min_diff))
        
        # Define thresholds for each level
        # These determine the minimum difference needed for full bonus
        # These correspond to optimal values achievable for each level
        thresholds = {
            'level4': 0.040489744395017624,
            'level3': 0.04904986172914505,
            'level2': 0.056118644773960114,
            'level1': 0.06297975778579712
        }
        
        threshold = thresholds.get(level_id, 0.040489744395017624)
        
        if min_diff >= threshold:
            bonus = 50.0
        else:
            bonus = (min_diff / threshold) * 50.0
    
    # Total score: base score (up to 50) + bonus (up to 50) = up to 100
    final_score = round(base_score + bonus)
    
    # Cap at 100%
    final_score = min(100, final_score)
    
    return final_score
`;export{e as default};
