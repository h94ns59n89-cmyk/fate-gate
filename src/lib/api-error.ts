export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public httpStatus: number = 400,
    public detail?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(code: number, message: string, detail?: Record<string, unknown>) {
    super(code, message, 400, detail);
    this.name = 'ValidationError';
  }
}

export class AuthError extends ApiError {
  constructor(code: number, message: string, httpStatus: number = 401) {
    super(code, message, httpStatus);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends ApiError {
  constructor(code: number, message: string) {
    super(code, message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(code: number, message: string) {
    super(code, message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = '请求过于频繁，请稍后再试') {
    super(429001, message, 429);
    this.name = 'RateLimitError';
  }
}

export class PaymentError extends ApiError {
  constructor(code: number, message: string) {
    super(code, message, 402);
    this.name = 'PaymentError';
  }
}

export class ExternalError extends ApiError {
  constructor(code: number, message: string, httpStatus: number = 502) {
    super(code, message, httpStatus);
    this.name = 'ExternalError';
  }
}
