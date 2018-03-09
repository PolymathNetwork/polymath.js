'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _SecurityTokenRegistrar = require('polymath-core/build/contracts/SecurityTokenRegistrar.json');

var _SecurityTokenRegistrar2 = _interopRequireDefault(_SecurityTokenRegistrar);

var _Contract2 = require('./Contract');

var _Contract3 = _interopRequireDefault(_Contract2);

var _PolyToken = require('./PolyToken');

var _PolyToken2 = _interopRequireDefault(_PolyToken);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // TODO @bshevchenko: will be replaced with artifact from polymath-core_v2 npm package


var SecurityTokenRegistrar = function (_Contract) {
  _inherits(SecurityTokenRegistrar, _Contract);

  function SecurityTokenRegistrar() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, SecurityTokenRegistrar);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SecurityTokenRegistrar.__proto__ || Object.getPrototypeOf(SecurityTokenRegistrar)).call.apply(_ref, [this].concat(args))), _this), _this.fee = new _bignumber2.default(100000), _this.namespace = 'polymath', _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(SecurityTokenRegistrar, [{
    key: 'isPreAuth',
    value: async function isPreAuth() {
      try {
        var allowance = await _PolyToken2.default.allowance(this.account, this.address);
        var currBalance = await _PolyToken2.default.myBalance();
        return allowance.gte(this.fee) && currBalance.gte(this.fee);
      } catch (e) {
        // eslint-disable-next-line
        console.log('Pre-auth check failed', e);
        return false;
      }
    }
  }, {
    key: 'preAuth',
    value: async function preAuth() {
      await _PolyToken2.default.approve(this.address, this.fee);
    }
  }, {
    key: 'createSecurityToken',
    value: async function createSecurityToken(token) {
      await this._tx(this._methods.createSecurityToken(this.namespace, token.name, token.ticker, new _bignumber2.default(10).toPower(token.decimals).times(token.totalSupply), token.decimals, token.owner, 8));
      // TODO @bshevchenko: update API
    }
  }]);

  return SecurityTokenRegistrar;
}(_Contract3.default);

exports.default = new SecurityTokenRegistrar(_SecurityTokenRegistrar2.default);