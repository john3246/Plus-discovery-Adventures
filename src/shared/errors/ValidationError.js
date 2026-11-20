import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(fields = {}) { super('Invalid input', 422, 'VALIDATION_ERROR'); this.fields = fields; }
}
