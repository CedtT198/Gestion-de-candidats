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


export const getCandidates = async (
  req: Request,
  res: Response
) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();

  const filter: Record<string, any> = {
    deletedAt: null
  };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex }
    ];
  }

  if (status) {
    filter.status = status;
  }

  const total = await Candidate.countDocuments(filter);
  const pages = Math.max(Math.ceil(total / limit), 1);
  const items = await Candidate.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    items,
    total,
    page,
    pages,
    limit
  });
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
        returnDocument: 'after',
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
      returnDocument: 'after'
    }
  );

  if (!candidate) {
    return res.status(404).json({
      message: "Candidat introuvable ou supprimé"
    });
  }

  res.json(result);
};