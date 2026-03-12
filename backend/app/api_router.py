from fastapi import APIRouter

# import route files
from app.routes.return_routes import router as return_router
from app.routes.analyze_routes import router as analyze_router
from app.routes.action_routes import router as action_router
from app.routes.advanced_ai_routes import router as advanced_router

# create main router
router = APIRouter()

# include routers
router.include_router(return_router, prefix="/returns", tags=["Returns"])
router.include_router(analyze_router, prefix="/ai", tags=["AI"])
router.include_router(action_router, prefix="/api", tags=["Actions"])
router.include_router(advanced_router, prefix="/api/advanced", tags=["Advanced AI Toolkit"])