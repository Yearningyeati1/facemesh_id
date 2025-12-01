from sqlalchemy import Column, Integer, String, JSON
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mesh_path = Column(String)
    # Storing embedding as JSON array for SQLite compatibility
    # In Postgres, we could use ARRAY(Float) but JSON is more portable for this demo
    embedding = Column(JSON)
