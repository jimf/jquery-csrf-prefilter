'use strict';

var SAFE_METHODS = 'GET OPTIONS HEAD TRACE'.split(' '),
    DEFAULT_HEADER = 'X-CSRF-Token';

/**
 * Is the given HTTP method (e.g., GET) non-destructive?
 *
 * @param {string} method HTTP method to test
 * @param {string[]} [safeMethods] HTTP methods to consider as "safe"
 * @return {boolean}
 */
function isSafeMethod(method, safeMethods) {
    method = method.toUpperCase();
    return (safeMethods || SAFE_METHODS).some(function(safeMethod) {
        return method.toUpperCase() === safeMethod;
    });
}

/**
 * Inject CSRF token via header.
 *
 * @param {string} header Header name to create
 * @param {string} tokenValue CSRF token value
 * @param {object} jqXHR jQuery jqXHR object
 */
function injectHeader(header, tokenValue, jqXHR) {
    jqXHR.setRequestHeader(header, tokenValue);
}

/**
 * Inject CSRF token via POST body
 *
 * @param {string} tokenValue CSRF token value
 * @param {object} options jQuery prefilter options
 * @param {string} key POST data key
 */
function injectData(tokenValue, options, key) {
    var data;
    if (~options.contentType.indexOf('application/json')) {
        data = options.data ? JSON.parse(options.data) : {};
        data[key] = tokenValue;
        options.data = JSON.stringify(data);
    } else {
        options.data += options.data ? '&' : '';
        options.data += key + '=' + tokenValue;
    }
}

/**
 * Inject CSRF token via query param.
 *
 * @param {string} tokenValue CSRF token value
 * @param {object} options jQuery prefilter options
 * @param {string} param Query param key
 */
function injectQuery(tokenValue, options, param) {
    options.url += ~options.url.indexOf('?') ? '&' : '?';
    options.url += param + '=' + tokenValue;
}

/**
 * Configure a jQuery CSRF prefilter callback.
 *
 * @param {string|function} tokenValue CSRF token value
 * @param {object} [opts] Configuration options
 * @param {string} [options.header] Inject token with given header
 * @param {string} [options.data] Inject token with given POST body key
 * @param {string} [options.query] Inject token with given query param
 */
module.exports = function(tokenValue, opts) {
    opts = opts || {};

    return function(options, originalOptions, jqXHR) {
        /*jshint maxcomplexity:7*/
        if (isSafeMethod(options.type, opts.ignoreMethods)) { return; }

        tokenValue = typeof tokenValue === 'function' ? tokenValue() : tokenValue;

        if (opts.header) { injectHeader(opts.header, tokenValue, jqXHR); }
        if (opts.data)   { injectData(tokenValue, options, opts.data); }
        if (opts.query)  { injectQuery(tokenValue, options, opts.query); }

        if (!opts.header && !opts.data && !opts.query) {
            injectHeader(DEFAULT_HEADER, tokenValue, jqXHR);
        }
    };
};
