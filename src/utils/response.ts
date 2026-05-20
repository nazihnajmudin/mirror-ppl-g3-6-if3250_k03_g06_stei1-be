import { Response } from 'express';

// Pemetaan status code ke HTTP Status Type standar
const getHttpStatusType = (code: number): string => {
  const statusTypes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };
  return statusTypes[code] || 'UNKNOWN_ERROR';
};

export const successResponse = (res: Response, data: any, message = 'Berhasil', code = 200) => {
  return res.status(code).json({ status: 'success', message, data });
};

export const errorResponse = (res: Response, message: string, code = 400, details?: any) => {
  const response: any = { 
    status: 'error', 
    message,
    error: {
      code,
      type: getHttpStatusType(code),
      timestamp: new Date().toISOString(),
    }
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(code).json(response);
};