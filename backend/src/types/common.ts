export interface ApiResponse {
  code: boolean;
  message: string;
  result: unknown;
}
export type PaginatorResponseType<T> = {
  page: number;
  data: T[];
  total: number;
  limit: number;
};

export type PaginatorRequestType = {
  skip: number;
  limit: number;
  page: number;
};

export type TimeZone = Intl.DateTimeFormatOptions["timeZone"];
