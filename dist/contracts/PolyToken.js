'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _PolyToken = require('../../tmp/PolyToken.json');

var _PolyToken2 = _interopRequireDefault(_PolyToken);

var _Contract2 = require('./Contract');

var _Contract3 = _interopRequireDefault(_Contract2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // TODO @bshevchenko: will be replaced with artifact from polymath-core_v2 npm package


var PolyToken = function (_Contract) {
  _inherits(PolyToken, _Contract);

  function PolyToken() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PolyToken);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PolyToken.__proto__ || Object.getPrototypeOf(PolyToken)).call.apply(_ref, [this].concat(args))), _this), _this.decimals = 18, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(PolyToken, [{
    key: 'addDecimals',
    value: function addDecimals(n) {
      return new _bignumber2.default(10).toPower(this.decimals).times(n);
    }
  }, {
    key: 'removeDecimals',
    value: function removeDecimals(n) {
      return new _bignumber2.default(n).div(new _bignumber2.default(10).toPower(this.decimals));
    }
  }, {
    key: 'balanceOf',
    value: async function balanceOf(account) {
      return this.removeDecimals((await this._methods.balanceOf(account).call()));
    }
  }, {
    key: 'myBalance',
    value: async function myBalance() {
      return this.balanceOf(this.account);
    }
  }, {
    key: 'allowance',
    value: async function allowance(owner, spender) {
      return this.removeDecimals((await this._methods.allowance(owner, spender).call()));
    }
  }, {
    key: 'getTokens',
    value: async function getTokens(amount) {
      await this._tx(this._methods.getTokens(this.addDecimals(amount)));
    }
  }, {
    key: 'approve',
    value: async function approve(spender, amount) {
      await this._tx(this._methods.approve(spender, this.addDecimals(amount)));
    }
  }]);

  return PolyToken;
}(_Contract3.default);

exports.default = new PolyToken(_PolyToken2.default);