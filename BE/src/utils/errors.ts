export type ErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: ErrorDetails;

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
