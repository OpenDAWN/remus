"use strict";
var Item = require('./item');
var misc = require('./misc');
var chalk = require('chalk');

var Duration = Item.extend("Duration", ["value", "unit"], {
  inspect: function() {
    return chalk.blue.bold(this.value) + ' ' + chalk.blue(this.unit);
  },
  
  init: function() {
    Item.prototype.init.call(this);
    this.unit = this.unit || "ms";
    return this;
  },

  toString: function() {
    return this.value + ' ' + this.unit;
  },
  
  toJSON: function() {
    if (this.value === 0) return 0;
    return [this.value, this.unit];
  },
  
  toXML: function(rootName) {
    return misc.buildXML(this.toXMLObject(), {rootName: rootName || 'duration'});
  },
  
  toXMLObject: function() {
    if (this.unit == '' || this.unit === 'divisions') return {_: this.value};
    return {_: this.value, '$': {unit: this.unit}};
  }
});

Duration.fromString = function(str, env) {
  var matches = str.match(/^([0-9\.]+)\s*([A-Za-z]*)$/);
  if (matches) {
    return new Duration({value: parseFloat(matches[1]), unit: matches[2]}, env);
  }
}

Duration.coerce = function(source, env, copy) {
  if (source instanceof Duration) {
    if (copy || (source.env !== env)) return new Duration(source, env);
    else return source;
  }
  if (typeof source === 'string') return Duration.fromString(source, env);
  if (typeof source === 'number') return new Duration({value: source}, env);
  if (source instanceof Array && source.length === 2) return new Duration({value: source[0], unit: source[1]}, env);
  throw new Error("Cannot coerce " + source + " to a duration!");
}

Duration.fromXML = function(xml) {
  var obj = misc.parseXML(xml, {explicitArray: false, mergeAttrs: true, explicitCharkey: true});
  return Duration.fromXMLObject(obj);
}

Duration.fromXMLObject = function(obj) {
  if (typeof obj === 'string') return new Duration(parseInt(obj), 'divisions');
  return new Duration({value: parseInt(obj._), unit: obj.unit || 'divisions'});
}

module.exports = Duration;
