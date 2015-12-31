'use strict';

var SAFE_METHODS = 'GET OPTIONS HEAD TRACE'.split(' '),
    DEFAULT_HEADER = 'X-CSRF-Token';

function isSafeMethod(method, safeMethods) {
    method = method.toUpperCase();
    return (safeMethods || SAFE_METHODS).some(function(safeMethod) {
        return method.toUpperCase() === safeMethod;
    });
}

function injectHeader(header, tokenValue, jqXHR) {
    jqXHR.setRequestHeader(header, tokenValue);
}

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

function injectQuery(tokenValue, options, param) {
    options.url += ~options.url.indexOf('?') ? '&' : '?';
    options.url += param + '=' + tokenValue;
}

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
