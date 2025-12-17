from fastapi import APIRouter

from . import test, user, auth

router = APIRouter()
# router.include_router(user_router, prefix="/user", tags=["user"])
router.include_router(test.router, prefix="/test", tags=["test"])
router.include_router(user.router, prefix="/user", tags=["user"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])

# custom objects
from . import person
router.include_router(person.router, prefix="/person", tags=["person"])



