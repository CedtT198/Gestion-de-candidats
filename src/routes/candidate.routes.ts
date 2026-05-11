import { Router } from "express";

import {
  createCandidate,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  validateCandidate
} from "../controllers/candidate.controller";

import { validate } from "../middlewares/validate.middleware";
import { candidateSchema } from "../validations/candidate.validation";

import { authMiddleware } from "../middlewares/auth.middleware";
import { login } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);

router.post("/", authMiddleware, validate(candidateSchema), createCandidate);
router.get("/:id", authMiddleware, getCandidate);
router.put("/:id", authMiddleware, validate(candidateSchema), updateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);
router.post("/:id/validate", authMiddleware, validateCandidate);

export default router;