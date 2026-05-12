import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { USERS } from "../config/users";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: "Identifiants invalides"
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d"
    }
  );

  return res.json({
    message: "Connexion réussie",
    token
  });
};