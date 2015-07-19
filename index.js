var config = require('zefti-config');
var utils = require('zefti-utils');
module.exports = function(options) {
  var responseFields = null;
  var responseFieldsOption = options.responseFields;

  if (typeof responseFieldsOption === 'string') {
    responseFields = config.response[responseFieldsOption];
  } else {
    responseFields = responseFieldsOption;
  }
  if (!responseFields || utils.type(responseFields) !== 'array') throw new Error('responseFields is not formed well');

  function responseHandler(payload, cb) {
    var response = {};
    responseFields.forEach(function (field) {
      if (payload && payload[field]) {
        response[field] = payload[field];
      }
    });
    payload.res.send(response);
  }

  return responseHandler;

};