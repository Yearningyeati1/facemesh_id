from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    mesh_path: str
    embedding: List[float]

    model_config = {"from_attributes": True}

class InferenceResponse(BaseModel):
    success: bool
    vertices: List[List[float]]
    faces: List[List[int]]
    code: List[float]

class CompareResponse(BaseModel):
    similarity: float
    match_found: bool
    matched_user: Optional[str] = None

class UserUpdate(BaseModel):
    name: str

class IdentifyResponse(BaseModel):
    matches: List[dict] # List of {user_id, name, similarity}
