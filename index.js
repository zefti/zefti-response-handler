var utils = require('zefti-utils');
var config = require('zefti-config');

function responseParser(p, r, cb){
  var extErr = null;
  var b = null;
  if (utils.type(r) === 'object'){
    b = {};
    for (var key in r) {
      if(!p.hasOwnProperty(key)) continue;
      if (r[key] === 'mixed') {
        b[key] = p[key];
      } else if (r[key] === 'string') {
        if (utils.type(p[key]) !== 'string') return cb('string type did not match for: ' + key);
        b[key] = p[key];
      } else if (r[key] === 'number') {
        if (utils.type(p[key]) !== 'number') return cb('number type did not match for: ' + key);
        b[key] = p[key];
      } else if (r[key] === 'date') {
        if (utils.type(p[key]) === 'date') {
          b[key] = p[key].toISOString();
        } else if (utils.type(p[key]) === 'number') {
          b[key] = new Date(p[key]).toISOString();
        } else {
          if (utils.type(parseInt(p[key])) !== 'number') return cb('this is not a valid date: ' + p[key]);
          b[key] = new Date(parseInt(p[key])).toISOString();
        }
      } else if (r[key] === 'boolean') {
        if (utils.type(p[key]) !== 'boolean') return cb('boolean type did not match for: ' + key);
        b[key] = p[key];
      }else if (utils.type(r[key]) === 'object' || utils.type(r[key]) === 'array') {
        if (utils.type(r[key]) !== utils.type(p[key])) return cb('object check - the type did not match for key: ' + key);
        responseParser(p[key], r[key], function(err, result){
          if (err) extErr = err;
          b[key] = result;
        });
      } else {
        return cb('The type of the key is unknown');
      }
    }
  } else if (utils.type(r) === 'array') {
    if(utils.type(p) !== 'array') return cb('rules state array, payload is not an array: ' + key);
    b = [];
    p.forEach(function(item){
      if (utils.type(item) === 'mixed') {
        b.push(item);
      } else if (utils.type(item) === 'string') {
        b.push(item)
      } else if (utils.type(item) === 'number') {
        b.push(item);
      } else if (utils.type(item) === 'boolean') {
        b.push(item);
      } else if (utils.type(item) === 'object') {
        if (!r[0]) return;
        if (utils.type(item) !== utils.type(r[0])) return cb('array check - r is not an object: ' + key);
        responseParser(item, r[0], function(err, result){
          if (err) extErr = err;
          b.push(result);
        });
      } else if (utils.type(p[key]) === 'array') {
        if (!r[0]) return;
        if (utils.type(item) !== utils.type(r[0])) return cb('array check - r is not an array: ' + key);
        responseParser(item, r[0], function(err, result){
          if (err) extErr = err;
          b.push(result);
        });
      } else {
        return cb('The type of the key is unknown, the type is: ' + utils.type(p[key]));
      }
    });
  } else if (utils.type(r) === 'string'){
    b = '';
    //TODO: build for string?
  }
  return cb(extErr, b);
}
/*
var errorHandler = function(res, err){
  res.replied = true;
  res.status(500).send({ error: err });
  return null;
};
*/

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
    responseParser(payload, responseFields, function(err, response){
      if (err) return cb(err);
      payload.res.send(response);
    });
  }

  return responseHandler;

};