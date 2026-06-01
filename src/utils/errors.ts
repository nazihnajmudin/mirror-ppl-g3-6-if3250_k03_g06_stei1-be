export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Email atau password salah') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Akun Anda tidak memiliki akses') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Data sudah ada atau terjadi konflik') {
        super(message, 409);
    }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}