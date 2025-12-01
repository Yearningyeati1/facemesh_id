from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import requests
import shutil
import os
import json
import trimesh
import numpy as np
from typing import List

import models, schemas, database, mesh_utils

from fastapi.staticfiles import StaticFiles

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure meshes directory exists
MESH_DIR = "meshes"
os.makedirs(MESH_DIR, exist_ok=True)

# Mount meshes directory
app.mount("/meshes", StaticFiles(directory="meshes"), name="meshes")

INFERENCE_API_URL = "http://127.0.0.1:5011/infer"

@app.get("/")
def read_root():
    return {"status": "online"}

@app.post("/inference", response_model=schemas.InferenceResponse)
async def run_inference(file: UploadFile = File(...)):
    """
    Proxy request to the inference API.
    """
    try:
        # Forward the file to the inference API
        files = {"image": (file.filename, file.file, file.content_type)}
        response = requests.post(INFERENCE_API_URL, files=files)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Inference API failed")
            
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register", response_model=schemas.User)
async def register_user(
    name: str = Form(...),
    vertices: str = Form(...), # JSON string of vertices
    faces: str = Form(...),    # JSON string of faces
    code: str = Form(...),     # JSON string of embedding code
    db: Session = Depends(database.get_db)
):
    """
    Save mesh to disk and user to database.
    """
    try:
        # Parse mesh data
        verts = np.array(json.loads(vertices))
        tris = np.array(json.loads(faces))
        
        # Create mesh object
        mesh = trimesh.Trimesh(vertices=verts, faces=tris, process=False)
        
        # Generate unique filename
        filename = f"{name.replace(' ', '_')}_{os.urandom(4).hex()}.obj"
        filepath = os.path.join(MESH_DIR, filename)
        
        # Export mesh
        mesh.export(filepath)
        
        # Parse embedding code
        embedding = json.loads(code)
        
        # Save to DB
        db_user = models.User(name=name, mesh_path=filepath, embedding=embedding)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@app.post("/compare", response_model=schemas.CompareResponse)
async def compare_face(
    user_id: int = Form(...),
    vertices: str = Form(...),
    faces: str = Form(...),
    code: str = Form(...),
    db: Session = Depends(database.get_db)
):
    """
    Compare uploaded mesh with a registered user's mesh.
    """
    try:
        # Get registered user
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Create temporary mesh for uploaded data
        verts = np.array(json.loads(vertices))
        tris = np.array(json.loads(faces))
        mesh = trimesh.Trimesh(vertices=verts, faces=tris, process=False)
        
        temp_path = f"temp_{os.urandom(4).hex()}.obj"
        mesh.export(temp_path)
        
        # Parse embedding code
        new_embedding = json.loads(code)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        # Compare
        similarity = mesh_utils.compute_similarity(user.embedding, new_embedding)
        
        return {
            "similarity": similarity,
            "match_found": similarity > 0.8, # Threshold
            "matched_user": user.name if similarity > 0.8 else None
        }
        
    except Exception as e:
        print(f"Comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete mesh file
    if os.path.exists(user.mesh_path):
        os.remove(user.mesh_path)
        
    db.delete(user)
    db.commit()
    return {"success": True}

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = user_update.name
    db.commit()
    db.refresh(user)
    return user

@app.post("/identify", response_model=schemas.IdentifyResponse)
async def identify_user(
    code: str = Form(...),
    db: Session = Depends(database.get_db)
):
    try:
        # Parse embedding code
        new_embedding = json.loads(code)
        
        users = db.query(models.User).all()
        matches = []
        
        for user in users:
            similarity = mesh_utils.compute_similarity(user.embedding, new_embedding)
            matches.append({
                "user_id": user.id,
                "name": user.name,
                "similarity": similarity
            })
            
        # Sort by similarity desc
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        
        return {"matches": matches[:5]} # Return top 5
    except Exception as e:
        print(f"Identify error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
