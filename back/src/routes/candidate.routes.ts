import { Router } from "express";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  validateCandidate
} from "../controllers/candidate.controller";

import { validate } from "../middlewares/validate.middleware";
import { candidateSchema, partialCandidateSchema } from "../validations/candidate.validation";

import { authMiddleware } from "../middlewares/auth.middleware";
import { login } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.get("/", authMiddleware, getCandidates);
router.post("/", authMiddleware, validate(candidateSchema), createCandidate);
router.get("/:id", authMiddleware, getCandidate);
router.put("/:id", authMiddleware, validate(partialCandidateSchema), updateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);
router.post("/:id/validate", authMiddleware, validateCandidate);

export default router;