from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

# Import central API router
from app.api_router import router as api_router

# Create FastAPI application
app = FastAPI(
    title="AI Return Analytics API",
    description="Backend system for analyzing product returns using AI insights",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI Return Analytics Backend Running"}


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "Server is healthy"}


# Register Tortoise ORM with FastAPI
register_tortoise(
    app,
    db_url="sqlite://db.sqlite3",
    modules={
        "models": [
            "app.models.user",
            "app.models.return_model",
            "app.models.action_model"
        ]
    },
    generate_schemas=True,   # Automatically create database tables
    add_exception_handlers=True,
)