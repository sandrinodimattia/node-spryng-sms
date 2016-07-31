export default class ApiError extends Error {
  constructor(code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.code = code;
    this.message = message;
    this.name = 'ApiError';
  }

  toString () {
    return `${this.name}: ${this.message} (${this.code})`;
  }
}
