const n=`import json
from PIL import Image
import numpy as np

def lines_to_image(lines, N=200, S=512):
    R = S // 2
    
    # Create coordinate grids
    i, j = np.meshgrid(np.arange(-R, R), np.arange(-R, R), indexing="ij")
    mask = (i**2 + j**2) <= R**2
    points = np.stack((i[mask], j[mask]), axis=-1).astype(np.float32)
    
    # Generate angles
    angles = np.arange(N, dtype=np.float32) * np.pi / N
    
    num_points = points.shape[0]
    cos_angles = np.cos(angles)  # Shape: (N,)
    sin_angles = -np.sin(angles)  # Shape: (N,)
    
    # Stack rotation components: [cos(angles), -sin(angles)] -> shape (2, N)
    rotation_matrix = np.stack([cos_angles, sin_angles], axis=0)  # (2, N)
    
    # Rotate points: points @ rotation_matrix
    # points is (num_points, 2), rotation_matrix is (2, N)
    # Result: (num_points, N) - x-coordinates after rotation
    rotated_points = np.dot(points, rotation_matrix)  # (num_points, N)
    
    rotated_points_normalized = rotated_points / R  # (num_points, N)
    rotated_points_normalized = np.clip(rotated_points_normalized, -1, 1)
    rotated_points_line = N * np.arccos(rotated_points_normalized) / np.pi
    rotated_points_line = rotated_points_line - (np.arange(N) % 2)  # Broadcast subtraction
    
    closest_line = np.round(rotated_points_line / 2).astype(np.int32)
    closest_line = np.clip(closest_line, 0, N//2-1)
    
    rows = np.stack([
        R * np.cos((2 * np.arange(N//2) + 0) * np.pi / N),
        R * np.cos((2 * np.arange(N//2) + 1) * np.pi / N)
    ], axis=1)  # Shape: (N//2, 2)
    
    angle_indices = np.arange(N)  # (N,)
    angle_indices_broadcast = np.broadcast_to(angle_indices, (num_points, N))  # (num_points, N)
    
    # Advanced indexing: lines[closest_line, angle_indices_broadcast]
    # This gives L[i, j] = lines[closest_line[i, j], angle_indices_broadcast[i, j]]
    L = lines[closest_line, angle_indices_broadcast]
    L = np.clip(L, 0, 1)
    
    row_indices = np.arange(N) % 2  # (N,)
    row_indices_broadcast = np.broadcast_to(row_indices, (num_points, N))  # (num_points, N)
    row_values = rows[closest_line, row_indices_broadcast]  # (num_points, N)
    
    line_mask = np.abs(rotated_points - row_values) <= 1
    L = L * line_mask
    
    # Sum over angles and create image
    # I = torch.zeros((S, S))
    # I[mask] = L.sum(-1)
    I = np.zeros((S, S), dtype=np.float32)
    I[mask] = L.sum(axis=-1)  # Sum over the N dimension
    
    I = np.clip(I / 4, 0, 1)
    return I

def calculate_similarity(image1, image2):
    """
    Calculate similarity between two images using normalized cross-correlation.
    
    Args:
        image1, image2: numpy arrays of the same shape
    
    Returns:
        float: similarity score between 0 and 1
    """
    # Flatten images
    flat1 = image1.flatten()
    flat2 = image2.flatten()
    
    # Remove mean
    flat1 = flat1 - np.mean(flat1)
    flat2 = flat2 - np.mean(flat2)
    
    # Calculate norms
    norm1 = np.linalg.norm(flat1)
    norm2 = np.linalg.norm(flat2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    # Normalized cross-correlation
    similarity = np.dot(flat1, flat2) / (norm1 * norm2)
    
    # Convert to 0-1 range (similarity is typically -1 to 1)
    return similarity


def load_target_image(level, size=512):
    """
    Load and preprocess target image for a given level.
    """
    image_files = {
        'basic': 'star.jpg',
        'easy': 'olympic.png', 
        'medium': 'world.jpg',
        'hard': 'eye.jpg'
    }
    
    if level not in image_files:
        return None
    
    filename = image_files[level]
    path = f'{filename}'
    
    try:
        # Load image and convert to grayscale
        img = Image.open(path).convert('L')
        
        # Resize to target size
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convert to numpy array and normalize
        img_array = 1-np.array(img, dtype=np.float32) / 255.0
        
        # Apply circular mask
        R = size // 2
        i, j = np.meshgrid(np.arange(size), np.arange(size), indexing="ij")
        mask = (i - R)**2 + (j - R)**2 <= R**2
        img_array = img_array * mask
        
        return img_array
    except Exception as e:
        print(f"Error loading image {filename}: {e}")
        return None

def parse_weights(weights_str, N=200):
    """
    Parse weights string into numpy array.
    
    Args:
        weights_str: string containing weights separated by spaces and newlines
        N: number of points on the circle
    
    Returns:
        numpy array of shape (N, N//2) containing weights
    """
    if not weights_str or not weights_str.strip():
        return np.zeros((N, N//2))
    
    try:
        lines = weights_str.strip().split('\\n')
        weights = []
        
        for line in lines:
            if line.strip():
                # Split by spaces and convert to integers
                row_weights = [int(x) if x.strip() else 0 for x in line.split()]
                # Pad or truncate to N//2 columns
                if len(row_weights) < N//2:
                    row_weights.extend([0] * (N//2 - len(row_weights)))
                else:
                    row_weights = row_weights[:N//2]
                weights.append(row_weights)
        
        # Pad or truncate to N rows
        if len(weights) < N:
            weights.extend([[0] * (N//2) for _ in range(N - len(weights))])
        else:
            weights = weights[:N]
        
        return np.array(weights, dtype=np.float32)
    
    except Exception as e:
        print(f"Error parsing weights: {e}")
        return np.zeros((N, N//2))

def evaluate(level, answer):
    """
    Evaluate knit task submissions.
    """
    if not answer:
        return 0
        
    try:
        # Parse the weights from the answer (shape: N x N//2, values: 0-100)
        weights = parse_weights(answer)
        
        # Normalize weights from 0-100 to 0-1 range
        weights_normalized = weights / 100.0
        
        weights_transposed = weights_normalized.T  # Shape: (N//2, N)
        
        # Generate image from weights
        generated_image = lines_to_image(weights_transposed)
        
        # Load actual target image
        target_image = load_target_image(level)
        print('target_image', target_image is None)
        if target_image is None:
            print(f"Target image for level {level} not found, using placeholder")
            return 0
        
        # Calculate similarity score
        similarity = calculate_similarity(generated_image, target_image)
        
        # Convert to 0-100 score
        score = int( min(100, max(0.0, similarity * 110)) )
        if 'easy' in level:
            score = int( min(100, max(0.0, similarity * 135)) )
        
        print(f"Level {level}: {score} points (similarity: {similarity:.3f})")
        return score
    except Exception as e:
        print(f"Error processing level {level}: {e}")
        return 0

`;export{n as default};
