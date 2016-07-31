export default class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.code = code;
    this.message = message;
    this.name = 'ValidationError';
  }

  toString () {
    return `${this.name}: ${this.message} (${this.code})`;
  }
}
