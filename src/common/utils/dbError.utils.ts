import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface DatabaseError {
  code: string;
  detail?: string;
  message?: string;
  constraint?: string;
}

export const handleDBError = (error: any): never => {
  const dbError = error as DatabaseError;

  // PostgreSQL error codes
  switch (dbError.code) {
    case '23505': {
      // Unique violation
      const constraintName = dbError.constraint || 'unknown';
      let message = 'Duplicate entry detected';

      // Mensajes más específicos basados en la constraint
      if (constraintName.includes('email')) {
        message = 'Email already exists';
      } else if (constraintName.includes('name')) {
        message = 'Name already exists';
      }

      throw new ConflictException(message);
    }

    case '23503': // Foreign key violation
      throw new BadRequestException('Referenced record does not exist');

    case '23502': // Not null violation
      throw new BadRequestException('Required field is missing');

    case '23514': // Check constraint violation
      throw new BadRequestException('Data validation failed');

    case '42601': // Syntax error
      throw new InternalServerErrorException('Database query syntax error');

    case '42703': // Undefined column
      throw new InternalServerErrorException('Database column does not exist');

    case '08006': // Connection failure
      throw new InternalServerErrorException('Database connection failed');

    case '53300': // Too many connections
      throw new InternalServerErrorException(
        'Database connection limit exceeded',
      );

    default: {
      // Si no es un error de PostgreSQL conocido, revisar el mensaje
      if (dbError.message?.includes('not found')) {
        throw new NotFoundException('Record not found');
      }

      if (dbError.message?.includes('duplicate')) {
        throw new ConflictException('Duplicate entry');
      }

      // Error genérico
      console.error('Unhandled database error:', error);
      throw new InternalServerErrorException(
        'An unexpected database error occurred',
      );
    }
  }
};
