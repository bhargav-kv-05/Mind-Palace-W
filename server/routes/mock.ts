import { RequestHandler } from "express";
import { mockSeed } from "../../shared/mock-data";

export const listInstitutions: RequestHandler = (_req, res) => {
  res.json(mockSeed.institutions);
};

export const listAccounts: RequestHandler = (_req, res) => {
  res.json(mockSeed.accounts);
};

export const getSeed: RequestHandler = (_req, res) => {
  res.json(mockSeed);
};
