"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Serialize = require('php-serialize');

var EventEmitter = require('events');

var tools = require('./tools');

var Queue = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Queue, _EventEmitter);

  var _super = _createSuper(Queue);

  function Queue(_ref) {
    var _this;

    var _ref$driver = _ref.driver,
        driver = _ref$driver === void 0 ? 'redis' : _ref$driver,
        client = _ref.client,
        winston = _ref.winston,
        _ref$scope = _ref.scope,
        scope = _ref$scope === void 0 ? {} : _ref$scope,
        _ref$queue = _ref.queue,
        queue = _ref$queue === void 0 ? 'default' : _ref$queue,
        _ref$appname = _ref.appname,
        appname = _ref$appname === void 0 ? 'laravel' : _ref$appname,
        _ref$prefix = _ref.prefix,
        prefix = _ref$prefix === void 0 ? '_database_' : _ref$prefix,
        _ref$isQueueNotify = _ref.isQueueNotify,
        isQueueNotify = _ref$isQueueNotify === void 0 ? true : _ref$isQueueNotify;

    _classCallCheck(this, Queue);

    _this = _super.call(this);
    _this.driver = driver;
    _this.client = client;
    _this.winston = winston;
    _this.isQueueNotify = isQueueNotify;
    _this.scope = scope;
    _this.appname = appname;
    _this.prefix = prefix;
    _this.queue = queue;
    return _this;
  }

  _createClass(Queue, [{
    key: "listen",
    value: function listen() {
      switch (this.driver) {
        case 'redis':
          this.redisPop();
          break;
      }
    }
  }, {
    key: "push",
    value: function push(name, object) {
      switch (this.driver) {
        case 'redis':
          this.redisPush(name, object);
          break;
      }
    }
  }, {
    key: "redisPop",
    value: function redisPop() {
      var _this2 = this;

      var pop = function pop() {
        _this2.client.blpop(_this2.appname + _this2.prefix + 'queues:' + _this2.queue, 60000, function (err, replay) {
          if (err) {
            _this2.winston.error("Error node-laravel-queue ".concat(err));

            console.error("Error node-laravel-queue ".concat(err));
            return;
          }

          if (typeof replay[1] == 'undefined') {
            _this2.winston.error("Error node-laravel-queue Empty Redis info : ".concat(replay));

            console.error("Error node-laravel-queue Empty Redis info : ".concat(replay));
            return;
          }

          var obj = JSON.parse(replay[1]);
          var command = obj.data.command;

          if (_this2.scope.hasOwnProperty(obj.data.commandName) === false) {
            _this2.winston.error("Error node-laravel-queue Scope ".concat(obj.data.commandName, " not found"));

            console.error("Error node-laravel-queue Scope ".concat(obj.data.commandName, " not found"));
            return;
          }

          var raw = Serialize.unserialize(command, _this2.scope);

          _this2.emit('job', {
            name: obj.data.commandName,
            data: raw
          });

          if (_this2.isQueueNotify === true) {
            _this2.client.blpop(_this2.appname + _this2.prefix + 'queues:' + _this2.queue + ':notify', 60000, function (err, replay) {});
          }

          pop();
        });
      };

      pop();
    }
  }, {
    key: "redisPush",
    value: function redisPush(name, object) {
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var command = Serialize.serialize(object, this.scope);
      var data = {
        job: 'Illuminate\\Queue\\CallQueuedHandler@call',
        data: {
          commandName: name,
          command: command
        },
        timeout: timeout,
        uuid: tools.uuid(),
        id: Date.now(),
        attempts: 0,
        delay: delay,
        maxExceptions: null
      };

      if (this.isQueueNotify === false) {
        delete data.delay;
        delete data.maxExceptions;
        data = _objectSpread(_objectSpread({}, data), {}, {
          displayName: name,
          maxTries: null,
          timeoutAt: null
        });
      }

      this.client.rpush(this.appname + this.prefix + 'queues:' + this.queue, JSON.stringify(data), function (err, replay) {// Queue pushed
      });
    }
  }]);

  return Queue;
}(EventEmitter);

var Job = function Job(obj) {
  _classCallCheck(this, Job);

  this.job = null;
  this.connection = null;
  this.queue = null;
  this.chainConnection = null;
  this.chainQueue = null;
  this.delay = null;
  this.middleware = [];
  this.chained = [];

  if (obj) {
    Object.assign(this, obj); // <============ No ...
  }
};

module.exports = {
  Queue: Queue,
  Job: Job
};