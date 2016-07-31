export default class ArgumentError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    this.name = 'ArgumentError';
  }

  toString () {
    return `${this.name}: ${this.message}`;
  }
}
