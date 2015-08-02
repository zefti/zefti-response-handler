var utils = require('zefti-utils');

function responseParser(p, r){
  var b = null;
  if (utils.type(r) === 'object'){
    b = {};
    for (var key in r) {
      if (!p[key]) continue;
      if (r[key] === 'string') {
        if (utils.type(p[key]) !== 'string') return errorHandler('string type did not match for: ' + key);
        b[key] = p[key]
      } else if (r[key]) === 'number') {
        if (utils.type(p[key]) !== 'number') return errorHandler('number type did not match for: ' + key);
        b[key] = p[key]
      } else if (utils.type(r[key]) === 'object' || utils.type(r[key]) === 'array') {
        if (utils.type(r[key]) !== utils.type(p[key])) return errorHandler('object check - the type did not match for key: ' + key);
        b[key] = responseHandler2(p[key], r[key]);
      } else {
        return errorHandler('The type of the key is unknown');
      }
    }
  } else if (utils.type(r) === 'array') {
    if(utils.type(p) !== 'array') return errorHandler('rules state array, payload is not an array: ' + key);
    b = [];
    p.forEach(function(item){
      if (utils.type(item) === 'string') {
        b.push(item)
      } else if (utils.type(item) === 'number'){
        b.push(item);
      } else if (utils.type(item) === 'object') {
        if (utils.type(item) !== utils.type(r[0])) return errorHandler('array check - r is not an object: ' + key);
        b.push(responseHandler2(item, r[0]));
      } else if (utils.type(p[key]) === 'array') {
        if (utils.type(item) !== utils.type(r[0])) return errorHandler('array check - r is not an array: ' + key);
        b.push(responseHandler2(item, r[0]));
      } else {
        return errorHandler('The type of the key is unknown, the type is: ' + utils.type(p[key]));
      }
    });
  } else if (utils.type(r) === 'string'){
    b = '';
  }
  return (b);
}

var errorHandler = function(err){
  res.status(500).send({ error: err });
};

modules.exports = function(options){
  if (typeof responseFieldsOption === 'string') {
    responseFields = config.response[responseFieldsOption];
  } else {
    responseFields = responseFieldsOption;
  }

  function responseHandler(payload, cb){
    var response = responseParser(payload, responseFields);
    payload.res.send(response);
  }

  return responseHandler;

};