import { Response } from "express";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const sendOk = <T>(res: Response, message: string, data?: T) => {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(200).json(body);
};

