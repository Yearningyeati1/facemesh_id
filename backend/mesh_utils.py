import trimesh
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def get_mesh_embedding(mesh_path: str) -> list:
    """
    Load FLAME mesh, normalize, compute per-vertex identity weights,
    and produce a weighted embedding vector.
    """

    try:
        mesh = trimesh.load(mesh_path, force='mesh')

        # Extract vertices
        V = mesh.vertices  # (5023, 3)

        # 1. Center the mesh
        V = V - V.mean(axis=0, keepdims=True)

        # 2. Normalize to unit sphere
        scale = np.max(np.linalg.norm(V, axis=1))
        V = V / scale

        # 3. Compute identity-sensitive weights
        #    (higher for nose, jaw, brow; lower for mouth/eyes)
        y = V[:, 1]
        z = V[:, 2]

        nose_weight = (z - z.min()) / (z.max() - z.min())      # nose depth
        jaw_weight = (y.min() - y) / (y.min() - y.mean())      # jawline
        mid_face = np.exp(-((y - y.mean())**2) / 0.1)          # mouth/eyes suppression

        W = (
            3.0 * nose_weight +
            2.5 * jaw_weight +
            0.5 * (1 - mid_face)
        )

        # Clamp and normalize
        W = np.clip(W, 0.1, None)
        W = W / np.max(W)

        # 4. Build embedding = weighted vertices flattened
        weighted_V = (V * W[:, None]).flatten()

        # 5. Normalize embedding vector
        norm = np.linalg.norm(weighted_V)
        if norm > 0:
            weighted_V = weighted_V / norm

        return weighted_V.tolist()

    except Exception as e:
        print(f"Error in get_mesh_embedding for {mesh_path}: {e}")
        return []

def compute_similarity(emb1: list, emb2: list) -> float:
    """
    Compute cosine similarity between two embeddings.
    """
    if not emb1 or not emb2:
        return 0.0
    
    v1 = np.array(emb1).reshape(1, -1)
    v2 = np.array(emb2).reshape(1, -1)
    
    return float(cosine_similarity(v1, v2)[0][0])
