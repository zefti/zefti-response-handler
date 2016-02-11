var utils = require('zefti-utils');
var config = require('zefti-config');

function responseParser(p, r, res){
  var b = null;
  if (utils.type(r) === 'object'){
    b = {};
    for (var key in r) {
      if (!p[key]) continue;
      if (r[key] === 'string') {
        if (utils.type(p[key]) !== 'string') return errorHandler(res, 'string type did not match for: ' + key);
        b[key] = p[key]
      } else if (r[key] === 'number') {
        if (utils.type(p[key]) !== 'number') return errorHandler(res, 'number type did not match for: ' + key);
        b[key] = p[key]
      } else if (r[key] === 'date') {
        if (utils.type(p[key]) === 'date') {
          b[key] = p[key].toISOString();
        } else if (utils.type(p[key]) === 'number') {
          b[key] = new Date(p[key]).toISOString();
        } else {
          if (utils.type(parseInt(p[key])) !== 'number') return errorHandler(res, 'this is not a valid date: ' + p[key]);
          b[key] = new Date(parseInt(p[key])).toISOString();
        }
      } else if (r[key] === 'boolean') {
        if (utils.type(p[key]) !== 'boolean') return errorHandler(res, 'boolean type did not match for: ' + key);
        b[key] = p[key];
      }else if (utils.type(r[key]) === 'object' || utils.type(r[key]) === 'array') {
        if (utils.type(r[key]) !== utils.type(p[key])) return errorHandler(res, 'object check - the type did not match for key: ' + key);
        b[key] = responseParser(p[key], r[key], res);
      } else {
        return errorHandler(res, 'The type of the key is unknown');
      }
    }
  } else if (utils.type(r) === 'array') {
    if(utils.type(p) !== 'array') return errorHandler(res, 'rules state array, payload is not an array: ' + key);
    b = [];
    p.forEach(function(item){
      if (utils.type(item) === 'string') {
        b.push(item)
      } else if (utils.type(item) === 'number'){
        b.push(item);
      } else if (utils.type(item) === 'boolean'){
        b.push(item);
      } else if (utils.type(item) === 'object') {
        if (!r[0]) return;
        if (utils.type(item) !== utils.type(r[0])) return errorHandler(res, 'array check - r is not an object: ' + key);
        b.push(responseParser(item, r[0], res));
      } else if (utils.type(p[key]) === 'array') {
        if (!r[0]) return;
        if (utils.type(item) !== utils.type(r[0])) return errorHandler(res, 'array check - r is not an array: ' + key);
        b.push(responseParser(item, r[0], res));
      } else {
        return errorHandler(p.res, 'The type of the key is unknown, the type is: ' + utils.type(p[key]));
      }
    });
  } else if (utils.type(r) === 'string'){
    b = '';
  }
  return (b);
}

var errorHandler = function(res, err){
  res.status(500).send({ error: err });
};

module.exports = function(options){
  var responseFields = null;
  var responseFieldsOption = options.responseFields;
  var responseValidation = options.responseValidation;

  if (typeof responseFieldsOption === 'string') {
    responseFields = responseValidation[responseFieldsOption];
  } else {
    responseFields = responseFieldsOption;
  }

  function responseHandler(payload, cb){
    var response = responseParser(payload, responseFields, payload.res);
    payload.res.send(response);
  }

  return responseHandler;

};