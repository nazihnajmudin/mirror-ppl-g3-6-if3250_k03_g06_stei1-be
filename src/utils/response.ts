import { Response } from 'express';

export const successResponse = (res: Response, data: any, message = 'Berhasil', code = 200) => {
  return res.status(code).json({ status: 'success', message, data });
};

export const errorResponse = (res: Response, message: string, code = 400, details?: any) => {
  const response: any = { status: 'error', message };
  if (details) {
    response.details = details;
  }
  return res.status(code).json(response);
};
