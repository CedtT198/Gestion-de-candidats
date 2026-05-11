import { Request, Response } from "express";
import Candidate from "../models/candidate.model";
import { candidateSchema,  partialCandidateSchema } from "../validations/candidate.validation";
import { asyncValidation } from "../services/validation.service";


export const createCandidate = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = candidateSchema.parse(req.body);
    const candidate = await Candidate.create(validatedData);

    res.status(201).json(candidate);
  } catch (error: any) {
    res.status(400).json({
      message: error.errors || error.message
    });
  }
};


export const getCandidate = async (
  req: Request,
  res: Response
) => {
  const candidate = await Candidate.findOne({
    _id: req.params.id,
    deletedAt: null
  });

  if (!candidate) {
    return res.status(404).json({
      message: "Candidat introuvable"
    });
  }

  res.json(candidate);
};


export const updateCandidate = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = partialCandidateSchema.parse(req.body);

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json(candidate);
  } catch (error: any) {
    res.status(400).json({
      message: error.errors || error.message
    });
  }
};


export const deleteCandidate = async (
  req: Request,
  res: Response
) => {
  await Candidate.findByIdAndUpdate(req.params.id, {
    deletedAt: Date.now()
  });

  res.json({
    message: "Soft suppression effectuée"
  });
};


// candidat validé meme si sup
// export const validateCandidate = async (
//   req: Request,
//   res: Response
// ) => {
//   const result = await asyncValidation();

//   await Candidate.findByIdAndUpdate(req.params.id, {status: "validated"});

//   res.json(result);
// };

// candidat supprime ne peut pas etre valide
export const validateCandidate = async (
  req: Request,
  res: Response
) => {
  const result = await asyncValidation();

  const candidate = await Candidate.findOneAndUpdate(
    {
      _id: req.params.id,
      deletedAt: null
    },
    {
      status: "validated"
    },
    {
      new: true
    }
  );

  if (!candidate) {
    return res.status(404).json({
      message: "Candidat introuvable ou supprimé"
    });
  }

  res.json(result);
};