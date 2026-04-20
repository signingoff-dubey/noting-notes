"""
NOTED FastAPI Backend - Main Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env before routes
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from backend.routes import notes, tasks, folders, ai, vault, attachments


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure directories exist
    print("NOTED Backend Starting up...")
    yield
    # Shutdown
    print("NOTED Backend Shutting down...")


app = FastAPI(
    title="NOTED API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware to allow localhost:3000
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router)
app.include_router(tasks.router)
app.include_router(folders.router)
app.include_router(ai.router)
app.include_router(vault.router)
app.include_router(attachments.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "noted-backend"}

