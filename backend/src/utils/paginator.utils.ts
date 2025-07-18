import { PaginatorRequestType, PaginatorResponseType } from "@/types/common";
import { Request } from "express";

export const getPaginatedResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatorResponseType<T> => ({
  page,
  data: items,
  total,
  limit,
});

export const parsePaginatedRequest = (req: Request): PaginatorRequestType => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  return {
    limit,
    skip: limit * (page - 1),
    page,
  };
};
