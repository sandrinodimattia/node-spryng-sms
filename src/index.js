import SmsApiClient from './SmsApiClient';
import ApiError from './errors/ApiError';
import ArgumentError from './errors/ArgumentError';

module.exports = (options) => {
  return new SmsApiClient(options);
};

module.exports.SmsApiClient = SmsApiClient;
module.exports.ApiError = ApiError;
module.exports.ArgumentError = ArgumentError;
