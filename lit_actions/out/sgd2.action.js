/**
 *
 * NAME: sgd2
 *
 */

"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // lit_actions/src/sgd2.action.ts
  var require_sgd2_action = __commonJS({
    "lit_actions/src/sgd2.action.ts"(exports) {
      (() => __async(exports, null, function* () {
        const sigShare = yield LitActions.signEcdsa({
          toSign: new Uint8Array([1, 2, 3, 4, 5]),
          publicKey,
          // <-- You should pass this in jsParam
          sigName
        });
        LitActions.setResponse({
          response: JSON.stringify({
            foo: "bar"
          })
        });
      }))();
    }
  });
  require_sgd2_action();
})();
