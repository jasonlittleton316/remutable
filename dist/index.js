"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = (process.env.NODE_ENV !== "production");var __PROD__ = !__DEV__;var __BROWSER__ = (typeof window === "object");var __NODE__ = !__BROWSER__;var _ = require("lodash-next");

var MUTATIONS = {
  SET: "s",
  DEL: "d" };

function salt() {
  return _.random(0, Number.MAX_VALUE - 1);
}

var Remutable = (function () {
  var Remutable = function Remutable() {
    this._data = {};
    this._mutations = {};
    this._version = 0;
    this._hash = salt();
  };

  Remutable.prototype.get = function (key) {
    if (this._mutations[key] !== void 0) {
      var m = this._mutations[key].m;
      var v = this._mutations[key].v;
      if (m === MUTATIONS.DEL) {
        return void 0;
      }
      if (m === MUTATIONS.SET) {
        return v;
      }
    }
    return this._data[key];
  };

  Remutable.prototype.checkout = function (key) {
    return this._data[key];
  };

  Remutable.prototype.set = function (key, val) {
    this._mutations[key] = { d: MUTATIONS.SET, v: val };
  };

  Remutable.prototype.del = function (key) {
    this._mutations[key] = { d: MUTATIONS.DEL };
  };

  Remutable.prototype.keys = function () {
    var _this = this;
    var keysMap = {};
    Object.keys(this._data).forEach(function (key) {
      keysMap[key] = true;
    });
    Object.keys(this._mutations).forEach(function (key) {
      var m = _this._mutations[key].m;
      if (m === MUTATIONS.SET) {
        keysMap[key] = true;
      }
      if (m === MUTATIONS.DEL) {
        delete keysMap[key];
      }
    });
    return Object.keys(keysMap);
  };

  Remutable.prototype.map = function (fn) {
    var _this2 = this;
    // fn(value, key): any
    return this.keys().map(function (key) {
      return fn(_this2.get(key), key);
    });
  };

  Remutable.prototype.destroy = function () {
    this._mutations = null;
    this._data = null;
    this._version = {}; // === this._version will always be falsy
    this._hash = {}; // === this._hash will always be falsy
  };

  Remutable.prototype.commit = function () {
    return this._applyPatchWithoutCheckingMutations({
      mutations: this._mutations,
      version: this._version,
      hash: this._hash,
      nextVersion: this._version + 1,
      nextHash: salt() });
  };

  Remutable.prototype.equals = function (remutable) {
    this._mutations.should.eql({});
    remutable._mutations.should.eql({});
    return this._hash === remutable._hash && this._version === remutable._version;
  };

  Remutable.prototype.rollback = function () {
    this._mutations = {};
  };

  Remutable.prototype.canApply = function (patch) {
    var hash = patch.hash;
    var version = patch.version;
    return (this._hash === hash && this._version === version);
  };

  Remutable.prototype._applyPatchWithoutCheckingMutations = function (patch) {
    var _this3 = this;
    var mutations = patch.mutations;
    var nextVersion = patch.nextVersion;
    var nextHash = patch.nextHash;
    this.canApply(patch).should.be.ok;
    Object.keys(mutations).forEach(function (key) {
      var m = _this3._mutations[key].m;
      var v = _this3._mutations[key].v;
      if (m === MUTATIONS.DEL) {
        delete _this3._data[key];
      }
      if (m === MUTATIONS.SET) {
        _this3._data[key] = v;
      }
    });
    this._version = nextVersion;
    this._hash = nextHash;
    this._mutations = {};
    return patch;
  };

  Remutable.prototype.apply = function (patch) {
    this._mutations.should.eql({});
    return this._applyPatchWithoutCheckingMutations(patch);
  };

  Remutable.prototype.serialize = function () {
    return JSON.stringify({
      hash: this._hash,
      version: this._version,
      data: this._data });
  };

  Remutable.unserialize = function (serialized) {
    var _ref = JSON.parse(serialized);

    var hash = _ref.hash;
    var version = _ref.version;
    var data = _ref.data;
    _.dev(function () {
      return hash.should.be.a.Number && version.should.be.a.Number && data.should.be.an.Object;
    });
    var remutable = new Remutable();
    remutable._hash = hash;
    remutable._version = version;
    remutable._data = data;
    return remutable;
  };

  return Remutable;
})();

_.extend(Remutable.prototype, {
  _data: null,
  _mutations: null,
  _version: null,
  _hash: null });

module.exports = Remutable;