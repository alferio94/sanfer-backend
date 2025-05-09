import { BadRequestException } from '@nestjs/common';

export const handleDBError = (error: any) => {
  const dbError = error as { code: string; detail: string };
  if (dbError.code === '23505') {
    throw new BadRequestException('Duplicate entry');
  }
  throw new Error('Database error');
};
