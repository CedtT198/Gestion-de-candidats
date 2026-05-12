import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          errors: err.issues.map((e) => ({
            field: e.path[0],
            message: e.message
          }))
        });
      }

      return res.status(500).json({
        message: "Erreur serveur"
      });
    }
  };