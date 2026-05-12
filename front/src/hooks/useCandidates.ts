import { useQuery } from "@tanstack/react-query";
import { getCandidates } from "../api/candidates.api";

export type Candidate = {
    _id: string,
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    // deletedAt: Date;
    // createdAt: Date;
    // updatedAt: Date;
};

export type CandidatesResponse = {
  items: Candidate[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export const useCandidates = (
  page: number,
  filters: { search?: string; status?: string } = {}
) => {
  return useQuery<CandidatesResponse>({
    queryKey: ["candidates", page, filters.search ?? "", filters.status ?? ""],
    queryFn: () => getCandidates(page, { search: filters.search, status: filters.status })
  });
};