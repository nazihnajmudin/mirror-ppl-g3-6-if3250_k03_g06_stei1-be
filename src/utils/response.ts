import { Response } from 'express';

export const successResponse = (res: Response, data: any, message = 'Berhasil', code = 200) => {
  return res.status(code).json({ status: 'success', message, data });
};

export const errorResponse = (res: Response, message: string, code = 400, error?: any) => {
  return res.status(code).json({ status: 'error', message, error: error?.message || error });
};
