/*!
 * Copyright 2017, nju33
 * Released under the MIT License
 * https://github.com/nju33/suwa
 */
var Suwa = (function () {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hamster = createCommonjsModule(function (module, exports) {
/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          delatZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else {
  // CommonJS
  module.exports = Hamster;
}

})(window, window.document);
});

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$2(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$2;

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal$1;

var freeGlobal = _freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal || freeSelf || Function('return this')();

var _root = root$1;

var root = _root;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now$1 = function() {
  return root.Date.now();
};

var now_1 = now$1;

var root$2 = _root;

/** Built-in value references. */
var Symbol$1 = root$2.Symbol;

var _Symbol = Symbol$1;

var Symbol$2 = _Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag$1;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString$1;

var Symbol = _Symbol;
var getRawTag = _getRawTag;
var objectToString = _objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$1(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

var _baseGetTag = baseGetTag$1;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike$1;

var baseGetTag = _baseGetTag;
var isObjectLike = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol$1;

var isObject$3 = isObject_1;
var isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$3(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$3(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber$1;

var isObject$1 = isObject_1;
var now = now_1;
var toNumber = toNumber_1;

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;
var nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce$1(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject$1(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce$1;

var debounce = debounce_1;
var isObject = isObject_1;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

var throttle_1$1 = throttle;

var performanceNow = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(commonjsGlobal);
});

var now$2 = performanceNow;
var root$3 = typeof window === 'undefined' ? commonjsGlobal : window;
var vendors = ['moz', 'webkit'];
var suffix = 'AnimationFrame';
var raf = root$3['request' + suffix];
var caf = root$3['cancel' + suffix] || root$3['cancelRequest' + suffix];

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root$3[vendors[i] + 'Request' + suffix];
  caf = root$3[vendors[i] + 'Cancel' + suffix]
      || root$3[vendors[i] + 'CancelRequest' + suffix];
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60;

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now$2()
        , next = Math.max(0, frameDuration - (_now - last));
      last = next + _now;
      setTimeout(function() {
        var cp = queue.slice(0);
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0;
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last);
            } catch(e) {
              setTimeout(function() { throw e }, 0);
            }
          }
        }
      }, Math.round(next));
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    });
    return id
  };

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true;
      }
    }
  };
}

var index = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root$3, fn)
};
var cancel = function() {
  caf.apply(root$3, arguments);
};
var polyfill = function() {
  root$3.requestAnimationFrame = raf;
  root$3.cancelAnimationFrame = caf;
};

index.cancel = cancel;
index.polyfill = polyfill;

function wrapPage(el) {
  var wrapper = document.createElement('div');
  wrapper.classList = 'suwa page-wrapper';
  wrapper.appendChild(el);
  return wrapper;
}

function calcOuterWidth(el) {
  var style = window.getComputedStyle(el);
  var props = ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth', 'marginLeft', 'marginRight'];

  return props.reduce(function (result, prop) {
    result += getNumber(style[prop]);
    return result;
  }, 0);

  function getNumber(cssVal) {
    var matches = cssVal.match(/^\d+/);
    if (matches === null) {
      return 0;
    }
    return Number(matches[0]);
  }
}



function offTransition(el, cb) {
  index(function () {
    el.style.transition = 'none';

    var reset = function reset() {
      index(function () {
        el.style.transition = '';
      });
    };

    index(function () {
      cb(reset);
    });
  });
}

function filterChildren(parent, ignoreClass) {
  var result = Array.prototype.slice.call(parent.children).filter(function (el) {
    if (!ignoreClass) {
      return true;
    }
    return !el.classList.contains(ignoreClass);
  });
  return result;
}

function circulate(els) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  // const idx = els.findIndex(el => {
  //   Number(el.getAttribute('data-nth')) === offset
  // });
  // const arr = els.concat(els).slice(els.findIndex(offset), els.length);
  var middleIdx = Math.floor((els.length - 1) / 2);
  var heads = els.slice(0, middleIdx + 1);
  var tails = els.slice(middleIdx + 1, els.length);
  return tails.concat(heads);
}

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function teardownEach ( iterations, detach, start ) {
	for ( var i = ( start || 0 ); i < iterations.length; i += 1 ) {
		iterations[i].teardown( detach );
	}
}

function createElement ( name ) {
	return document.createElement( name );
}

function createSvgElement ( name ) {
	return document.createElementNS( 'http://www.w3.org/2000/svg', name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function createComment () {
	return document.createComment( '' );
}

function addEventListener ( node, event, handler ) {
	node.addEventListener ( event, handler, false );
}

function removeEventListener ( node, event, handler ) {
	node.removeEventListener ( event, handler, false );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute ( attribute, value );
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( newState );
	( this._root || this )._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}

function applyComputations ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'pages' in newState && typeof state.pages === 'object' || state.pages !== oldState.pages ) || ( 'active' in newState && typeof state.active === 'object' || state.active !== oldState.active ) ) {
		state.activeIdx = newState.activeIdx = template.computed.activeIdx( state.pages, state.active );
	}
	
	if ( isInitial || ( 'active' in newState && typeof state.active === 'object' || state.active !== oldState.active ) ) {
		state.activeNth = newState.activeNth = template.computed.activeNth( state.active );
	}
	
	if ( isInitial || ( 'pagerLoop' in newState && typeof state.pagerLoop === 'object' || state.pagerLoop !== oldState.pagerLoop ) || ( 'pages' in newState && typeof state.pages === 'object' || state.pages !== oldState.pages ) || ( 'active' in newState && typeof state.active === 'object' || state.active !== oldState.active ) ) {
		state.prevPage = newState.prevPage = template.computed.prevPage( state.pagerLoop, state.pages, state.active );
	}
	
	if ( isInitial || ( 'pagerLoop' in newState && typeof state.pagerLoop === 'object' || state.pagerLoop !== oldState.pagerLoop ) || ( 'pages' in newState && typeof state.pages === 'object' || state.pages !== oldState.pages ) || ( 'active' in newState && typeof state.active === 'object' || state.active !== oldState.active ) ) {
		state.nextPage = newState.nextPage = template.computed.nextPage( state.pagerLoop, state.pages, state.active );
	}
}

var template = (function () {
return {
  data() {
    return {
      defaultStyle: {
        height: '50vh',
        width: '100vw',
        accentColor: '#cb1b45',
        subColor: '#222',
        baseColor: '#fff'
      },
      style: null,

      progress: false,
      pagerLoop: false,
      // pagerLoop: {
      //   autoScroll: 3000,
      // },

      keyMaps: false,
      // keyMaps: {
      //   prevPage: 37,
      //   nextPage: 39
      // },

      wheel: false,

      pager: {
        inset: true
      },
      pages: [],

      pagerUpdating: false,
      scroll: false,
      active: null,

      __autoScrollId: null,
      __init: false,
      __touched: false
    };
  },
  computed: {
    activeIdx(pages, active) {
      if (pages.length === 0 || active === null) {
        return 0;
      }
      return pages.findIndex(p => p === active);
    },
    activeNth(active){
      if (active === null) {
        return 0;
      }
      return Number(active.getAttribute('data-nth'));
    },
    prevPage(pagerLoop, pages, active) {
      if (pages.length === 0 || active === null) {
        return null;
      }

      const nth = Number(active.getAttribute('data-nth'));
      let nextNth = nth - 1;
      if (pagerLoop && nextNth === -1) {
        nextNth = pages.length - 1;
      } else if (!pagerLoop && nextNth === -1) {
        return null;
      }

      const next = pages.find(page => {
        const pageNth = Number(page.getAttribute('data-nth'));
        return nextNth === pageNth;
      });
      return next;
    },
    nextPage(pagerLoop, pages, active) {
      if (pages.length === 0, active === null) {
        return null;
      }

      const nth = Number(active.getAttribute('data-nth'));
      let nextNth = nth + 1;
      if (pagerLoop && nextNth === pages.length) {
        nextNth = 0;
      } else if (!pagerLoop && nextNth === pages.length) {
        return null;
      }

      const next = pages.find(page => {
        const pageNth = Number(page.getAttribute('data-nth'));
        return nextNth === pageNth;
      });
      return next;
    }
  },
  methods: {
    changePage(page) {
      const {container} = this.refs;
      const {__autoScrollId, pagerLoop, active} = this.get();
      if (active === null && page === active) {
        return;
      }

      if (__autoScrollId !== null) {
        clearTimeout(__autoScrollId);
        this.set({__autoScrollId: null});
      }

      this.set({
        active: page,
        __init: true
      });

      if (this.get('__autoScrollId') === null && pagerLoop.autoScroll > 0) {
        this.set({__autoScrollId: setTimeout(() => {
          this.set({__autoScrollId: null});
          this.changeNextPage();
        }, pagerLoop.autoScroll)});
      }
    },
    changePrevPage: throttle_1$1(function () {
      const {__autoScrollId, pagerLoop, prevPage} = this.get();

      if (prevPage !== null) {
        if (__autoScrollId !== null) {
          clearTimeout(__autoScrollId);
          this.set({__autoScrollId: null});
        }
        this.set({
          active: prevPage,
          __init: true
        });
      }

      if (this.get('__autoScrollId') === null && pagerLoop.autoScroll > 0) {
        this.set({__autoScrollId: setTimeout(() => {
          this.set({__autoScrollId: null});
          this.changeNextPage();
        }, pagerLoop.autoScroll)});
      }
    }, 777),
    changeNextPage: throttle_1$1(function () {
      const {nextPage, __autoScrollId, pagerLoop} = this.get();

      if (nextPage !== null) {
        if (__autoScrollId !== null) {
          clearTimeout(__autoScrollId);
          this.set({__autoScrollId: null});
        }
        this.set({
          active: nextPage,
          __init: true
        });
      }

      if (this.get('__autoScrollId') === null && pagerLoop.autoScroll > 0) {
        this.set({__autoScrollId: setTimeout(() => {
          this.set({__autoScrollId: null});
          this.changeNextPage();
        }, pagerLoop.autoScroll)});
      }
    }, 777),
    mouseoverPager(ev) {
      const {style} = this.get();
      ev.currentTarget.style.background = style.accentColor;
    },
    mouseleavePager(ev, page) {
      const {active} = this.get();
      if (this.get('active') !== page) {
        ev.currentTarget.style.background = '';
      }
    },
    mouseoverPagerIcon(ev) {
      const {style} = this.get();
      const icon = ev.currentTarget.querySelector('.icon');
      icon.style.fill = style.accentColor;
    },
    mouseleavePagerIcon(ev) {
      const icon = ev.currentTarget.querySelector('.icon');
      icon.style.fill = '';
    },
    handleKeyMap(ev) {
      (keyMaps => {
        if (ev.keyCode === keyMaps.prevPage) {
          this.changePrevPage();
        } else if (ev.keyCode === keyMaps.nextPage) {
          this.changeNextPage();
        }
      })(this.get('keyMaps'));
    },
    handleTouchStart(ev) {
      this.set({__touched: ev.touches[0].clientX});
    },
    handleTouchMove: throttle_1$1(function (ev) {
      const pos = this.get('__touched');
      if (!pos) {
        return;
      }

      if (pos - ev.touches[0].clientX > window.innerWidth / 5) {
        this.changeNextPage();
      } else if (pos - ev.touches[0].clientX < -(window.innerWidth / 5)) {
        this.changePrevPage();
      }
    }, 100),
    handleTouchEnd() {
      this.set({__touched: 0});
    }
  },
  oncreate() {
    const {style} = this.get();
    if (style === null) {
      this.set({style: {}});
    }

    const handleWheel = (() => {
      let amount = 0;
      let proc = false;

      return throttle_1$1((ev, delta, deltaX) => {
        const {active, prevPage, nextPage} = this.get();
        if (active === null || proc) {
          return;
        }

        amount += deltaX;
        if (amount > 30) {
          amount = 0;
          this.changeNextPage();
        } else if (amount < -30) {
          amount = 0;
          this.changePrevPage();
        }
      }, 600);
    })();

    this.observe('style', style => {
      const {defaultStyle} = this.get();
      if (typeof style !== 'object' || Array.isArray(style)) {
        throw new Error('Specify object as `style`')
      }
      this.set({style: Object.assign({}, defaultStyle, style)});
    });

    this.observe('active', (page, oldPage) => {
      const {pages, scroll, pagerUpdating, pagerLoop} = this.get();
      if (page === null || page === oldPage || scroll || pagerUpdating) {
        return;
      }

      const pageIdx = pages.findIndex(p => p === page);
      if (this.refs.pagerLinks) {
        const {pagerLinks} = this.refs;
        pagerLinks.style.width = pagerLinks.clientWidth + 'px';
      }

      let postPageProc = null;
      if (pagerLoop && (pageIdx === 0 || pageIdx === pages.length - 1)) {
        const {pager, pagerLinks, pages: pagesEl} = this.refs;
        const {style, active} = this.get();

        const removeingPageParent = pages[pageIdx].parentElement;
        const wrapper = wrapPage(pages[pageIdx]);
        if (this.get('wheel')) {
          hamster(wrapper).wheel(handleWheel);
          (t => {
            wrapper.addEventListener('touchstart', t.handleTouchStart.bind(t));
            wrapper.addEventListener('touchmove', t.handleTouchMove.bind(t));
            wrapper.addEventListener('touchend', t.handleTouchEnd.bind(t));
          })(this);
        }
        if (pageIdx === 0) {
          const {nextPage} = this.get();
          const cloned = nextPage.cloneNode(true);
          cloned.style.zIndex = 10;
          cloned.style.display = '';
          postPageProc = () => {
            pagesEl.insertBefore(
              wrapper,
              oldPage.parentElement.previousElementSibling ||
                pagesEl.children[0]
            );
            wrapper.nextElementSibling.appendChild(cloned);
            this.refs.pages.removeChild(removeingPageParent);
            cloned.parentElement.removeChild(cloned);
          };
        } else {
          const {prevPage} = this.get();
          const cloned = prevPage.cloneNode(true);
          cloned.style.zIndex = 10;
          cloned.style.display = '';
          postPageProc = () => {
            pagesEl.insertBefore(
              wrapper,
              oldPage.parentElement.nextElementSibling
            );
            wrapper.previousElementSibling.appendChild(cloned);
            this.refs.pages.removeChild(removeingPageParent);
            cloned.parentElement.removeChild(cloned);
          };
        }
        this.set({scroll: true});

        index(() => {
          const padding = calcOuterWidth(pagerLinks.children[0]) * 2 + 'px';
          const paddingProp = pageIdx === 0 ? 'paddingLeft' : 'paddingRight';
          pagerLinks.style[paddingProp] = padding;
          pager.style.zIndex = 2;
          setTimeout(() => {
            offTransition(pagerLinks, reset => {
              if (pageIdx === 0) {
                pages.unshift(pages.pop());
              } else {
                pages.push(pages.shift());
              }

              this.set({
                pages,
                scroll: false,
                pagerUpdating: true
              });

              setTimeout(() => {
                pagerLinks.style.transition = 'none';
                index(() => {
                  pagerLinks.style[paddingProp] = '0';
                  pager.style.zIndex = 9;
                  this.set({
                    pagerUpdating: false
                  });
                  reset();
                });
              }, 100);
            });
          }, 400);
        });
      }

      if (page.style.display === 'none') {
        page.style.display = '';
      }

      const target = oldPage ? oldPage : page;

      offTransition(container, reset => {
        if (postPageProc) {
          postPageProc();
        }

        let offset = target.parentElement.offsetLeft;
        // WTF
        container.style.transition = 'none';
        container.style.transform = `translate3d(-${offset}px, 0, 0)`;
        reset();

        if (oldPage) {
          index(() => {
            let offset = page.parentElement.offsetLeft;
            container.style.transform = `translate3d(-${offset}px, 0, 0)`;
          });
        }
      });
    });

    const {container, pages} = this.refs;

    const children = (() => {
      const {suwa} = this.refs;
      const _children = filterChildren(suwa.parentElement, 'suwa');
      _children.forEach((el, idx) => el.setAttribute('data-nth', idx));

      return this.get('pagerLoop') ? circulate(_children) : _children;
    })();

    offTransition(container, reset => {
      if (children.length < 1) {
        return;
      }

      children.forEach(el => {
        const wrapper = wrapPage(el);
        if (this.get('wheel')) {
          hamster(wrapper).wheel(handleWheel);
          (t => {
            wrapper.addEventListener('touchstart', t.handleTouchStart.bind(t));
            wrapper.addEventListener('touchmove', t.handleTouchMove.bind(t));
            wrapper.addEventListener('touchend', t.handleTouchEnd.bind(t));
          })(this);
        }
        pages.appendChild(wrapper);
      });

      this.set({pages: children});
      this.get('pagerLoop') ?
        this.set({active: children[Math.floor(children.length / 2)]}) :
        this.set({active: children[0]});

      reset();

      if (this.get('pagerLoop').autoScroll > 0) {
        setTimeout(() => {
          if (!this.get('__init')) {
            this.changeNextPage();
          }
        }, this.get('pagerLoop').autoScroll);
      }
    });

    if (this.get('keyMaps')) {
      document.body.addEventListener('keyup', this.handleKeyMap.bind(this));
    }
  },

  ondestroy() {
    if (this.get('keyMaps')) {
      document.body.removeEventListener('keyup', this.handleKeyMap.bind(this));
    }
  }
};
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n[svelte-2736315432].box, [svelte-2736315432] .box {\n  position: relative;\n  overflow: hidden;\n}\n\n[svelte-2736315432].page-container, [svelte-2736315432] .page-container {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: calc(100% + 30px);\n  -webkit-transition: .4s cubic-bezier(0.645, 0.045, 0.355, 1);\n  transition: .4s cubic-bezier(0.645, 0.045, 0.355, 1);\n}\n\n[svelte-2736315432].pages, [svelte-2736315432] .pages {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: calc(100% - 30px);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n\n[svelte-2736315432].pages .page-wrapper, [svelte-2736315432] .pages .page-wrapper {\n  min-width: 100vw;\n  max-width: 100vw;\n  background-color: #fff;\n  box-sizing: border-box;\n  padding: 1em;\n  position: relative;\n  z-index: 1;\n}\n\n[svelte-2736315432].pages .page-wrapper > *, [svelte-2736315432] .pages .page-wrapper > * {\n  position: absolute;\n  z-index: 1;\n}\n\n[svelte-2736315432].progress, [svelte-2736315432] .progress {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  height: 2px;\n  box-sizing: border-box;\n}\n\n[svelte-2736315432].progress.bar, [svelte-2736315432] .progress.bar {\n  -webkit-transition: .4s cubic-bezier(0.55, 0.055, 0.675, 0.19);\n  transition: .4s cubic-bezier(0.55, 0.055, 0.675, 0.19);\n}\n\n[svelte-2736315432].pager, [svelte-2736315432] .pager {\n  position: absolute;\n  right: 50%;\n  -webkit-transform: translateX(50%);\n          transform: translateX(50%);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  z-index: 1;\n}\n\n[svelte-2736315432].pager:first-of-type, [svelte-2736315432] .pager:first-of-type {\n  z-index: 2;\n}\n\n[svelte-2736315432].pager-links, [svelte-2736315432] .pager-links {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  position: relative;\n  -webkit-transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n  transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n  box-sizing: border-box;\n  overflow: hidden;\n}\n\n[svelte-2736315432].pager-link, [svelte-2736315432] .pager-link {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  position: relative;\n  width: .75em;\n  height: .75em;\n  min-width: .75em;\n  min-height: .75em;\n  margin: .5em;\n  cursor: pointer;\n  -webkit-transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n  transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n}\n\n[svelte-2736315432].pager-link:not(.prev):not(.next), [svelte-2736315432] .pager-link:not(.prev):not(.next) {\n  background: #222;\n  border-radius: 50%;\n}\n\n[svelte-2736315432].pager-link svg, [svelte-2736315432] .pager-link svg {\n  display: block;\n  fill: #222;\n  width: .5em;\n  -webkit-transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n  transition: .2s cubic-bezier(0.645, 0.045, 0.355, 1);\n}\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var ifBlock_anchor = createComment();
	
	function getBlock ( root ) {
		if ( root.style ) return renderIfBlock_0;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );

	return {
		mount: function ( target, anchor ) {
			insertNode( ifBlock_anchor, target, anchor );
			if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock ) ifBlock.teardown( detach );
			
			if ( detach ) {
				detachNode( ifBlock_anchor );
			}
		}
	};
}

function renderIfBlock_0 ( root, component ) {
	var div = createElement( 'div' );
	setAttribute( div, 'svelte-2736315432', '' );
	component.refs.suwa = div;
	div.className = "suwa box";
	div.style.cssText = "\n    width: " + ( root.style.width ) + ";\n    height: " + ( root.style.height ) + ";\n  ";
	
	var div1 = createElement( 'div' );
	setAttribute( div1, 'svelte-2736315432', '' );
	component.refs.container = div1;
	div1.className = "suwa page-container";
	
	appendNode( div1, div );
	
	var div2 = createElement( 'div' );
	setAttribute( div2, 'svelte-2736315432', '' );
	component.refs.pages = div2;
	div2.className = "suwa pages";
	div2.style.cssText = "\n        background-color: " + ( root.style.baseColor ) + ";\n      ";
	
	appendNode( div2, div1 );
	appendNode( createText( "\n\n    " ), div );
	var ifBlock1_anchor = createComment();
	appendNode( ifBlock1_anchor, div );
	
	function getBlock1 ( root ) {
		if ( root.progress && root.pages.length > 0 ) return renderIfBlock1_0;
		return null;
	}
	
	var currentBlock1 = getBlock1( root );
	var ifBlock1 = currentBlock1 && currentBlock1( root, component );
	
	if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
	appendNode( createText( "\n\n    " ), div );
	var ifBlock2_anchor = createComment();
	appendNode( ifBlock2_anchor, div );
	
	function getBlock2 ( root ) {
		if ( root.pager && root.pages.length > 0 ) return renderIfBlock2_0;
		return null;
	}
	
	var currentBlock2 = getBlock2( root );
	var ifBlock2 = currentBlock2 && currentBlock2( root, component );
	
	if ( ifBlock2 ) ifBlock2.mount( ifBlock2_anchor.parentNode, ifBlock2_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			div.style.cssText = "\n    width: " + ( root.style.width ) + ";\n    height: " + ( root.style.height ) + ";\n  ";
			
			div2.style.cssText = "\n        background-color: " + ( root.style.baseColor ) + ";\n      ";
			
			var _currentBlock1 = currentBlock1;
			currentBlock1 = getBlock1( root );
			if ( _currentBlock1 === currentBlock1 && ifBlock1) {
				ifBlock1.update( changed, root );
			} else {
				if ( ifBlock1 ) ifBlock1.teardown( true );
				ifBlock1 = currentBlock1 && currentBlock1( root, component );
				if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
			}
			
			var _currentBlock2 = currentBlock2;
			currentBlock2 = getBlock2( root );
			if ( _currentBlock2 === currentBlock2 && ifBlock2) {
				ifBlock2.update( changed, root );
			} else {
				if ( ifBlock2 ) ifBlock2.teardown( true );
				ifBlock2 = currentBlock2 && currentBlock2( root, component );
				if ( ifBlock2 ) ifBlock2.mount( ifBlock2_anchor.parentNode, ifBlock2_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( component.refs.suwa === div ) component.refs.suwa = null;
			if ( component.refs.container === div1 ) component.refs.container = null;
			if ( component.refs.pages === div2 ) component.refs.pages = null;
			if ( ifBlock1 ) ifBlock1.teardown( false );
			if ( ifBlock2 ) ifBlock2.teardown( false );
			
			if ( detach ) {
				detachNode( div );
			}
		}
	};
}

function renderIfBlock2_0 ( root, component ) {
	var div = createElement( 'div' );
	setAttribute( div, 'svelte-2736315432', '' );
	component.refs.pager = div;
	div.className = "suwa pager";
	div.style.cssText = "\n        bottom: " + ( root.pager.inset ? '1em' : '-2.3em' ) + ";\n      ";
	
	var a = createElement( 'a' );
	setAttribute( a, 'svelte-2736315432', '' );
	setAttribute( a, 'role', "button" );
	a.className = "suwa pager-link prev";
	a.style.cssText = "\n          opacity: " + ( !root.pagerLoop && root.activeIdx === 0 ? 0 : 1 ) + ";\n          cursor: " + ( !root.pagerLoop && root.activeIdx === 0 ? 'default' : '' ) + ";\n        ";
	
	function clickHandler ( event ) {
		component.changePrevPage();
	}
	
	addEventListener( a, 'click', clickHandler );
	
	function mouseoverHandler ( event ) {
		component.mouseoverPagerIcon(event);
	}
	
	addEventListener( a, 'mouseover', mouseoverHandler );
	
	function mouseleaveHandler ( event ) {
		component.mouseleavePagerIcon(event);
	}
	
	addEventListener( a, 'mouseleave', mouseleaveHandler );
	
	appendNode( a, div );
	appendNode( createText( "\n          " ), a );
	
	var svg = createSvgElement( 'svg' );
	setAttribute( svg, 'svelte-2736315432', '' );
	setAttribute( svg, 'version', "1.1" );
	setAttribute( svg, 'viewBox', "0 0 8 16" );
	setAttribute( svg, 'class', "suwa pager icon" );
	setAttribute( svg, 'aria-hidden', "true" );
	
	appendNode( svg, a );
	
	var path = createSvgElement( 'path' );
	setAttribute( path, 'svelte-2736315432', '' );
	setAttribute( path, 'fill-rule', "evenodd" );
	setAttribute( path, 'd', "M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5z" );
	
	appendNode( path, svg );
	appendNode( createText( "\n        " ), div );
	
	var div1 = createElement( 'div' );
	setAttribute( div1, 'svelte-2736315432', '' );
	component.refs.pagerLinks = div1;
	div1.className = "pager-links";
	
	appendNode( div1, div );
	
	var a1 = createElement( 'a' );
	setAttribute( a1, 'svelte-2736315432', '' );
	setAttribute( a1, 'role', "button" );
	a1.className = "\n            pager-link\n          ";
	a1.style.cssText = "\n            background-color: " + ( root.prevPage === root.active ? root.style.accentColor : root.style.subColor ) + ";\n            display: " + ( root.scroll ? 'block' : 'none' ) + ";\n          ";
	
	function clickHandler1 ( event ) {
		var root = this.__svelte.root;
		
		component.changePage(root.prevPage);
	}
	
	addEventListener( a1, 'click', clickHandler1 );
	
	function mouseoverHandler1 ( event ) {
		component.mouseoverPager(event);
	}
	
	addEventListener( a1, 'mouseover', mouseoverHandler1 );
	
	function mouseleaveHandler1 ( event ) {
		var root = this.__svelte.root;
		
		component.mouseleavePager(event, root.prevPage);
	}
	
	addEventListener( a1, 'mouseleave', mouseleaveHandler1 );
	
	a1.__svelte = {
		root: root
	};
	
	appendNode( a1, div1 );
	appendNode( createText( "\n          " ), div1 );
	var eachBlock_anchor = createComment();
	appendNode( eachBlock_anchor, div1 );
	var eachBlock_value = root.pages;
	var eachBlock_iterations = [];
	
	for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
		eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
		eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
	}
	
	appendNode( createText( "\n          " ), div1 );
	
	var a2 = createElement( 'a' );
	setAttribute( a2, 'svelte-2736315432', '' );
	setAttribute( a2, 'role', "button" );
	a2.className = "\n            pager-link\n          ";
	a2.style.cssText = "\n            background-color: " + ( root.nextPage === root.active ? root.style.accentColor : root.style.subColor ) + ";\n            display: " + ( root.scroll ? 'block' : 'none' ) + ";\n          ";
	
	function clickHandler2 ( event ) {
		var root = this.__svelte.root;
		
		component.changePage(root.nextPage);
	}
	
	addEventListener( a2, 'click', clickHandler2 );
	
	function mouseoverHandler2 ( event ) {
		component.mouseoverPager(event);
	}
	
	addEventListener( a2, 'mouseover', mouseoverHandler2 );
	
	function mouseleaveHandler2 ( event ) {
		var root = this.__svelte.root;
		
		component.mouseleavePager(event, root.nextPage);
	}
	
	addEventListener( a2, 'mouseleave', mouseleaveHandler2 );
	
	a2.__svelte = {
		root: root
	};
	
	appendNode( a2, div1 );
	appendNode( createText( "\n        " ), div );
	
	var a3 = createElement( 'a' );
	setAttribute( a3, 'svelte-2736315432', '' );
	setAttribute( a3, 'role', "button" );
	a3.className = "suwa pager-link next";
	a3.style.cssText = "\n          opacity: " + ( !root.pagerLoop && root.activeIdx === root.pages.length - 1 ? 0 : 1 ) + ";\n          cursor: " + ( !root.pagerLoop && root.activeIdx === root.pages.length - 1 ? 'default' : '' ) + ";\n        ";
	
	function clickHandler3 ( event ) {
		component.changeNextPage();
	}
	
	addEventListener( a3, 'click', clickHandler3 );
	
	function mouseoverHandler3 ( event ) {
		component.mouseoverPagerIcon(event);
	}
	
	addEventListener( a3, 'mouseover', mouseoverHandler3 );
	
	function mouseleaveHandler3 ( event ) {
		component.mouseleavePagerIcon(event);
	}
	
	addEventListener( a3, 'mouseleave', mouseleaveHandler3 );
	
	appendNode( a3, div );
	
	var svg1 = createSvgElement( 'svg' );
	setAttribute( svg1, 'svelte-2736315432', '' );
	setAttribute( svg1, 'version', "1.1" );
	setAttribute( svg1, 'viewBox', "0 0 8 16" );
	setAttribute( svg1, 'class', "suwa pager icon" );
	setAttribute( svg1, 'aria-hidden', "true" );
	
	appendNode( svg1, a3 );
	
	var path1 = createSvgElement( 'path' );
	setAttribute( path1, 'svelte-2736315432', '' );
	setAttribute( path1, 'fill-rule', "evenodd" );
	setAttribute( path1, 'd', "M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3z" );
	
	appendNode( path1, svg1 );
	var text5 = createText( "\n\n      " );
	
	var div2 = createElement( 'div' );
	setAttribute( div2, 'svelte-2736315432', '' );
	div2.className = "suwa pager";
	div2.style.cssText = "\n        bottom: " + ( root.pager.inset ? '1em' : '-2.3em' ) + ";\n        display: " + ( root.pagerUpdating ? '' : 'none' ) + ";\n      ";
	
	var div3 = createElement( 'div' );
	setAttribute( div3, 'svelte-2736315432', '' );
	div3.className = "pager-links";
	
	appendNode( div3, div2 );
	var eachBlock1_anchor = createComment();
	appendNode( eachBlock1_anchor, div3 );
	var eachBlock1_value = root.pages;
	var eachBlock1_iterations = [];
	
	for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
		eachBlock1_iterations[i1] = renderEachBlock1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
		eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
	}

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			insertNode( text5, target, anchor );
			insertNode( div2, target, anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			div.style.cssText = "\n        bottom: " + ( root.pager.inset ? '1em' : '-2.3em' ) + ";\n      ";
			
			a.style.cssText = "\n          opacity: " + ( !root.pagerLoop && root.activeIdx === 0 ? 0 : 1 ) + ";\n          cursor: " + ( !root.pagerLoop && root.activeIdx === 0 ? 'default' : '' ) + ";\n        ";
			
			a1.style.cssText = "\n            background-color: " + ( root.prevPage === root.active ? root.style.accentColor : root.style.subColor ) + ";\n            display: " + ( root.scroll ? 'block' : 'none' ) + ";\n          ";
			
			a1.__svelte.root = root;
			
			var eachBlock_value = root.pages;
			
			for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
				if ( !eachBlock_iterations[i] ) {
					eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
					eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
				} else {
					eachBlock_iterations[i].update( changed, root, eachBlock_value, eachBlock_value[i], i );
				}
			}
			
			teardownEach( eachBlock_iterations, true, eachBlock_value.length );
			
			eachBlock_iterations.length = eachBlock_value.length;
			
			a2.style.cssText = "\n            background-color: " + ( root.nextPage === root.active ? root.style.accentColor : root.style.subColor ) + ";\n            display: " + ( root.scroll ? 'block' : 'none' ) + ";\n          ";
			
			a2.__svelte.root = root;
			
			a3.style.cssText = "\n          opacity: " + ( !root.pagerLoop && root.activeIdx === root.pages.length - 1 ? 0 : 1 ) + ";\n          cursor: " + ( !root.pagerLoop && root.activeIdx === root.pages.length - 1 ? 'default' : '' ) + ";\n        ";
			
			div2.style.cssText = "\n        bottom: " + ( root.pager.inset ? '1em' : '-2.3em' ) + ";\n        display: " + ( root.pagerUpdating ? '' : 'none' ) + ";\n      ";
			
			var eachBlock1_value = root.pages;
			
			for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
				if ( !eachBlock1_iterations[i1] ) {
					eachBlock1_iterations[i1] = renderEachBlock1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
					eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
				} else {
					eachBlock1_iterations[i1].update( changed, root, eachBlock1_value, eachBlock1_value[i1], i1 );
				}
			}
			
			teardownEach( eachBlock1_iterations, true, eachBlock1_value.length );
			
			eachBlock1_iterations.length = eachBlock1_value.length;
		},
		
		teardown: function ( detach ) {
			if ( component.refs.pager === div ) component.refs.pager = null;
			removeEventListener( a, 'click', clickHandler );
			removeEventListener( a, 'mouseover', mouseoverHandler );
			removeEventListener( a, 'mouseleave', mouseleaveHandler );
			if ( component.refs.pagerLinks === div1 ) component.refs.pagerLinks = null;
			removeEventListener( a1, 'click', clickHandler1 );
			removeEventListener( a1, 'mouseover', mouseoverHandler1 );
			removeEventListener( a1, 'mouseleave', mouseleaveHandler1 );
			
			teardownEach( eachBlock_iterations, false );
			
			removeEventListener( a2, 'click', clickHandler2 );
			removeEventListener( a2, 'mouseover', mouseoverHandler2 );
			removeEventListener( a2, 'mouseleave', mouseleaveHandler2 );
			removeEventListener( a3, 'click', clickHandler3 );
			removeEventListener( a3, 'mouseover', mouseoverHandler3 );
			removeEventListener( a3, 'mouseleave', mouseleaveHandler3 );
			
			teardownEach( eachBlock1_iterations, false );
			
			if ( detach ) {
				detachNode( div );
				detachNode( text5 );
				detachNode( div2 );
			}
		}
	};
}

function renderEachBlock1 ( root, eachBlock1_value, page, x, component ) {
	var a = createElement( 'a' );
	setAttribute( a, 'svelte-2736315432', '' );
	setAttribute( a, 'role', "button" );
	a.className = "\n              pager-link button\n            ";
	a.style.cssText = "\n              background-color: " + ( (!root.scroll && root.active === page) || (root.scroll && root.active === page) ? root.style.accentColor : root.style.subColor ) + ";\n              -webkit-transition: none;\n              transition: none;\n            ";
	
	function clickHandler ( event ) {
		var eachBlock1_value = this.__svelte.eachBlock1_value, x = this.__svelte.x, page = eachBlock1_value[x];
		
		component.changePage(page);
	}
	
	addEventListener( a, 'click', clickHandler );
	
	function mouseoverHandler ( event ) {
		component.mouseoverPager(event);
	}
	
	addEventListener( a, 'mouseover', mouseoverHandler );
	
	function mouseleaveHandler ( event ) {
		var eachBlock1_value = this.__svelte.eachBlock1_value, x = this.__svelte.x, page = eachBlock1_value[x];
		
		component.mouseleavePager(event, page);
	}
	
	addEventListener( a, 'mouseleave', mouseleaveHandler );
	
	a.__svelte = {
		eachBlock1_value: eachBlock1_value,
		x: x
	};

	return {
		mount: function ( target, anchor ) {
			insertNode( a, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, page, x ) {
			var __tmp;
		
			a.style.cssText = "\n              background-color: " + ( (!root.scroll && root.active === page) || (root.scroll && root.active === page) ? root.style.accentColor : root.style.subColor ) + ";\n              -webkit-transition: none;\n              transition: none;\n            ";
			
			a.__svelte.eachBlock1_value = eachBlock1_value;
			a.__svelte.x = x;
		},
		
		teardown: function ( detach ) {
			removeEventListener( a, 'click', clickHandler );
			removeEventListener( a, 'mouseover', mouseoverHandler );
			removeEventListener( a, 'mouseleave', mouseleaveHandler );
			
			if ( detach ) {
				detachNode( a );
			}
		}
	};
}

function renderEachBlock ( root, eachBlock_value, page, x, component ) {
	var a = createElement( 'a' );
	setAttribute( a, 'svelte-2736315432', '' );
	setAttribute( a, 'role', "button" );
	a.className = "\n              pager-link button\n            ";
	a.style.cssText = "\n              background-color: " + ( (!root.scroll && root.active === page) || (root.scroll && root.active === page) ? root.style.accentColor : root.style.subColor ) + ";\n              -webkit-transition: " + ( root.active === page ? 'none' : '' ) + ";\n              transition: " + ( root.active === page ? 'none' : '' ) + ";\n            ";
	
	function clickHandler ( event ) {
		var eachBlock_value = this.__svelte.eachBlock_value, x = this.__svelte.x, page = eachBlock_value[x];
		
		component.changePage(page);
	}
	
	addEventListener( a, 'click', clickHandler );
	
	function mouseoverHandler ( event ) {
		component.mouseoverPager(event);
	}
	
	addEventListener( a, 'mouseover', mouseoverHandler );
	
	function mouseleaveHandler ( event ) {
		var eachBlock_value = this.__svelte.eachBlock_value, x = this.__svelte.x, page = eachBlock_value[x];
		
		component.mouseleavePager(event, page);
	}
	
	addEventListener( a, 'mouseleave', mouseleaveHandler );
	
	a.__svelte = {
		eachBlock_value: eachBlock_value,
		x: x
	};

	return {
		mount: function ( target, anchor ) {
			insertNode( a, target, anchor );
		},
		
		update: function ( changed, root, eachBlock_value, page, x ) {
			var __tmp;
		
			a.style.cssText = "\n              background-color: " + ( (!root.scroll && root.active === page) || (root.scroll && root.active === page) ? root.style.accentColor : root.style.subColor ) + ";\n              -webkit-transition: " + ( root.active === page ? 'none' : '' ) + ";\n              transition: " + ( root.active === page ? 'none' : '' ) + ";\n            ";
			
			a.__svelte.eachBlock_value = eachBlock_value;
			a.__svelte.x = x;
		},
		
		teardown: function ( detach ) {
			removeEventListener( a, 'click', clickHandler );
			removeEventListener( a, 'mouseover', mouseoverHandler );
			removeEventListener( a, 'mouseleave', mouseleaveHandler );
			
			if ( detach ) {
				detachNode( a );
			}
		}
	};
}

function renderIfBlock1_0 ( root, component ) {
	var div = createElement( 'div' );
	setAttribute( div, 'svelte-2736315432', '' );
	div.className = "suwa progress";
	
	var div1 = createElement( 'div' );
	setAttribute( div1, 'svelte-2736315432', '' );
	div1.className = "suwa progress bar";
	div1.style.cssText = "\n          background-color: " + ( root.style.accentColor ) + ";\n          width: " + ( root.activeNth / (root.pages.length - 1) * 100 ) + "%;\n        ";
	
	appendNode( div1, div );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			div1.style.cssText = "\n          background-color: " + ( root.style.accentColor ) + ";\n          width: " + ( root.activeNth / (root.pages.length - 1) * 100 ) + "%;\n        ";
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( div );
			}
		}
	};
}

function Suwa$1 ( options ) {
	options = options || {};
	this.refs = {};
	this._state = Object.assign( template.data(), options.data );
	applyComputations( this._state, this._state, {}, true );
	
	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};
	
	this._handlers = Object.create( null );
	
	this._root = options._root;
	this._yield = options._yield;
	
	this._torndown = false;
	if ( !addedCss ) addCss();
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.oncreate, context: this });
	} else {
		template.oncreate.call( this );
	}
}

Suwa$1.prototype = template.methods;

Suwa$1.prototype.get = get;
Suwa$1.prototype.fire = fire;
Suwa$1.prototype.observe = observe;
Suwa$1.prototype.on = on;
Suwa$1.prototype.set = set;
Suwa$1.prototype._flush = _flush;

Suwa$1.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	applyComputations( this._state, newState, oldState, false );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Suwa$1.prototype.teardown = Suwa$1.prototype.destroy = function destroy ( detach ) {
	this.fire( 'teardown' );
template.ondestroy.call( this );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

return Suwa$1;

}());
