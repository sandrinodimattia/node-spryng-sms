import rp from 'request-promise';
import Promise from 'bluebird';

import { ArgumentError, ApiError, ValidationError } from './errors';

export default class SmsApiClient {
  constructor({ baseUrl = 'https://api.spryngsms.com/api', username, password }) {
    if (username === null || username === undefined) {
      throw new ArgumentError('Must provide a username for the SMS Gateway API');
    }
    if ('string' !== typeof username || username.length === 0) {
      throw new ArgumentError('The provided username is invalid');
    }
    if (password === null || password === undefined) {
      throw new ArgumentError('Must provide a password for the SMS Gateway API');
    }
    if ('string' !== typeof password || password.length === 0) {
      throw new ArgumentError('The provided password is invalid');
    }

    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
  }

  getSendError(body) {
    switch (body) {
      case '100':
        return new ApiError('missing_parameter', 'Missing Parameter for the Send operation');
      case '101':
        return new ApiError('username_too_short', 'Username too short');
      case '102':
        return new ApiError('username_too_long', 'Username too long');
      case '103':
        return new ApiError('password_too_short', 'Password too short');
      case '104':
        return new ApiError('password_too_long', 'Password too long');
      case '105':
        return new ApiError('destination_too_short', 'Destination too short');
      case '106':
        return new ApiError('destination_too_long', 'Destination too long');
      case '108':
        return new ApiError('sender_too_short', 'Sender too short');
      case '107':
        return new ApiError('sender_too_long', 'Sender too long');
      case '109':
        return new ApiError('body_too_short', 'Body too short');
      case '110':
        return new ApiError('body_too_long', 'Body too long');
      case '200':
        return new ApiError('security_error', 'Security Error');
      case '201':
        return new ApiError('unknown_route', 'Unknown Route');
      case '202':
        return new ApiError('route_access_violation', 'Route Access Violation');
      case '203':
        return new ApiError('insufficient_credits', 'Insufficient Credits');
      case '800':
        return new ApiError('technical_error', 'Technical Error');
      default:
        return null;
    }
  }

  validateSendRequest(request) {
    if (request === null || request === undefined) {
      return new ValidationError('request_required', 'A request object needs to be provided');
    }
    if (request.destination === null || request.destination === undefined) {
      return new ValidationError('destination_required', 'Missing Destination for the Send operation');
    }
    if (request.route === null || request.route === undefined) {
      return new ValidationError('route_required', 'Missing Route for the Send operation');
    }
    if (request.body === null || request.body === undefined) {
      return new ValidationError('body_required', 'Missing Body for the Send operation');
    }
    if (request.sender === null || request.sender === undefined) {
      return new ValidationError('sender_required', 'Missing Sender for the Send operation');
    }
  }

  send(request) {
    const validationError = this.validateSendRequest(request);
    if (validationError) {
      return Promise.reject(validationError);
    }

    const options = {
      method: 'POST',
      uri: `${this.baseUrl}/send.php`,
      form: {
        OPERATION: 'send',
        USERNAME: this.username,
        PASSWORD: this.password,
        DESTINATION: Array.isArray(request.destination) ? request.destination.join(', ') : request.destination,
        ROUTE: request.route,
        ALLOWLONG: request.allowLong ? 1 : 0,
        BODY: request.body,
        SENDER: request.sender,
        REFERENCE: request.reference
      }
    };

    return rp(options)
      .then(body => {
        const sendError = this.getSendError(body);
        if (sendError) {
          return Promise.reject(sendError);
        }
      });
  }

  getRemainingCredit() {
    const options = {
      method: 'GET',
      uri: `${this.baseUrl}/check.php`,
      qs: {
        USERNAME: this.username,
        PASSWORD: this.password
      }
    };

    return rp(options)
      .then(body => {
        if (!body || body === '-1') {
          return Promise.reject(new ApiError('credit_check_error', 'Unknown error while trying to retrieve credit status'));
        }

        const credit = parseFloat(body);
        if (Number.isNaN(credit)) {
          return Promise.reject(new ApiError('credit_check_error', `Unable to parse credit details: ${credit}`));
        }

        return credit;
      });
  }
}
