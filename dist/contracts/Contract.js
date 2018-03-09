'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _web3EthContract = require('web3-eth-contract');

var _web3EthContract2 = _interopRequireDefault(_web3EthContract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Contract = function () {
  function Contract(_artifact) {
    var _this = this;

    _classCallCheck(this, Contract);

    this._artifact = null;
    this._contract = null;
    this._methods = null;
    this.address = null;

    this._artifact = _artifact;
    return new Proxy(this, {
      get: function get(target, field) {
        try {
          target._init();
        } catch (e) {
          // eslint-disable-next-line
          console.error('Contract init failed', e);
          return undefined;
        }
        if (field in target) {
          return target[field];
        }
        var method = target._contract.methods[field];
        if (_this._isView(field)) {
          return function () {
            return method.apply(undefined, arguments).call();
          };
        }
        return function () {
          return _this._tx(method.apply(undefined, arguments));
        };
      }
    });
  }

  _createClass(Contract, [{
    key: '_newContract',


    /** @private */
    value: function _newContract() {
      var isWebSockets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return new (isWebSockets ? Contract.params.web3WS : Contract.params.web3).eth.Contract(this._artifact.abi, this.address);
    }

    /** @private */

  }, {
    key: '_init',
    value: function _init() {
      var address = this._artifact.networks[Contract.params.id].address;

      if (this._contract && this.address === address) {
        return;
      }
      this.address = address;
      this._contract = this._newContract();
      this._methods = this._contract.methods;
    }

    /**
     * Checks whether a contract function is constant (view) or not.
     * @param name
     * @returns {boolean}
     * @private
     */

  }, {
    key: '_isView',
    value: function _isView(name) {
      for (var i = 0; i < this._artifact.abi.length; i++) {
        var method = this._artifact.abi[i];
        if (method.name === name) {
          return method.stateMutability === 'view';
        }
      }
      throw new Error('_isView: no method with "' + name + '" found');
    }

    /**
     * Checks whether a contract function has boolean output or not.
     * @param name
     * @returns {boolean}
     * @private
     */

  }, {
    key: '_isBoolOutput',
    value: function _isBoolOutput(name) {
      for (var i = 0; i < this._artifact.abi.length; i++) {
        var method = this._artifact.abi[i];
        if (method.name === name) {
          if (!method.outputs.length) {
            return false;
          }
          return method.outputs[0].name === '' && method.outputs[0].type === 'bool';
        }
      }
      throw new Error('_isBoolOutput: no method with "' + name + '" found');
    }

    /**
     * @param method
     * @returns {Promise.<Object>}
     * @protected
     */

  }, {
    key: '_tx',
    value: async function _tx(method) {
      var params = { from: this.account };
      params.gas = await method.estimateGas(params);

      // dry run
      try {
        var okCode = this._isBoolOutput(method._method.name);
        var dryResult = await method.call(params);
        if (okCode && dryResult !== okCode) {
          throw new Error('Expected ' + okCode + ', but received ' + dryResult);
        }
      } catch (e) {
        throw new Error('Transaction dry run failed: ' + e.message);
      }

      var receipt = await method.send(params, function (error, hash) {
        if (!error) {
          Contract.params.txHashCallback(hash);
        }
      });
      Contract.params.txEndCallback(receipt);

      if (receipt.status === '0x0') {
        throw new Error('Transaction failed');
      }

      return receipt;
    }
  }, {
    key: 'subscribe',
    value: async function subscribe(eventName, filter, callback) {
      try {
        await this._newContract(true).events[eventName]({ filter: filter }, function (error, event) {
          if (error) {
            // eslint-disable-next-line
            console.error('Event "' + eventName + '" subscription error', error);
            callback();
            return;
          }
          // eslint-disable-next-line
          console.log('Emitted ' + eventName + ' event', event);
          callback(event);
        });
        return true;
      } catch (e) {
        // eslint-disable-next-line
        console.error('Event "' + eventName + '" subscription failed', e);
        return false;
      }
    }

    /**
     * @param v
     * @returns {string}
     * @protected
     */

  }, {
    key: '_toBytes',
    value: function _toBytes(v) {
      return Contract._web3.utils.asciiToHex(v);
    }

    /**
     * @param v
     * @returns {boolean}
     * @protected
     */

  }, {
    key: '_isEmptyAddress',
    value: function _isEmptyAddress(v) {
      return v === '0x0000000000000000000000000000000000000000';
    }
  }, {
    key: 'account',
    get: function get() {
      return Contract.params.account;
    }
  }]);

  return Contract;
}();

Contract.params = null;
exports.default = Contract;