from fastapi import APIRouter
from app.services.mistral_service import analyze_return_comment
from app.services.clustering_service import generate_clusters

router = APIRouter()


@router.post("/analyze-return")
async def analyze(data: dict):

    comment = data["comment"]

    result = await analyze_return_comment(comment)

    return {
        "analysis": result
    }

@router.get("/cluster-returns")
async def cluster_returns():
    clusters = generate_clusters()
    return {"clusters": clusters}