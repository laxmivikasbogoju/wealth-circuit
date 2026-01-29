from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, market
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular dev server
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # allows OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(market.router)
