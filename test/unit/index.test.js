'use strict';

var assert = require('assert'),
    sinon = require('sinon'),
    createCsrfPrefilter = require('../..'),
    safeMethods = 'GET OPTIONS HEAD TRACE'.split(' '),
    unsafeMethods = 'POST PUT PATCH DELETE'.split(' ');

describe('jQuery CSRF prefilter factory', function() {
    var tokenValue, opts, options, originalOptions, jqXHR, prefilter;

    beforeEach(function() {
        tokenValue = 'some-csrf-token';
        opts = {};
        options = {};
        originalOptions = {};
        jqXHR = { setRequestHeader: sinon.stub() };
    });

    describe('when prefilter created with defaults', function() {

        beforeEach(function() {
            prefilter = createCsrfPrefilter(tokenValue);
        });

        describe('and ajax request is safe', function() {

            it('should not inject "X-CSRF-Token" header into request', function() {
                safeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.notCalled);
                });
            });
        });

        describe('and ajax request is unsafe', function() {

            it('should inject "X-CSRF-Token" header into request', function() {
                unsafeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });

    describe('when prefilter created with header option', function() {

        beforeEach(function() {
            opts.header = 'X-CSRFToken';
            prefilter = createCsrfPrefilter(tokenValue, opts);
        });

        describe('and ajax request is safe', function() {

            it('should not inject specified header into request', function() {
                safeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.notCalled);
                });
            });
        });

        describe('and ajax request is unsafe', function() {

            it('should inject specified header into request', function() {
                unsafeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.calledWith(opts.header, tokenValue));
                    assert(!jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });

    describe('when prefilter created with data option', function() {

        beforeEach(function() {
            opts.data = '_csrf';
            prefilter = createCsrfPrefilter(tokenValue, opts);
        });

        describe('and ajax request is safe', function() {

            it('should not inject specified data into request', function() {
                safeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(!options.data);
                });
            });
        });

        describe('and ajax request is unsafe', function() {

            it('should inject specified data into request', function() {
                unsafeMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert.strictEqual(JSON.parse(options.data)._csrf, tokenValue);
                    assert(!jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });

    describe('when prefilter created with query option', function() {

        beforeEach(function() {
            opts.query = '_csrf';
            prefilter = createCsrfPrefilter(tokenValue, opts);
        });

        describe('and ajax request is safe', function() {

            it('should not inject specified query param into request', function() {
                safeMethods.forEach(function(method) {
                    options.type = method;
                    options.url = '/some/url';
                    prefilter(options, originalOptions, jqXHR);
                    assert.strictEqual(options.url, '/some/url');
                });
            });
        });

        describe('and ajax request is unsafe', function() {

            it('should inject specified query param into request', function() {
                unsafeMethods.forEach(function(method) {
                    options.type = method;
                    options.url = '/some/url';
                    prefilter(options, originalOptions, jqXHR);
                    assert.strictEqual(options.url, '/some/url?_csrf=' + tokenValue);
                    assert(!jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));

                    options.url = '/some/url?foo=bar';
                    prefilter(options, originalOptions, jqXHR);
                    assert.strictEqual(options.url, '/some/url?foo=bar&_csrf=' + tokenValue);
                    assert(!jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });

    describe('when prefilter created with multiple options', function() {

        beforeEach(function() {
            opts.header = 'X-CSRFToken';
            opts.data = '_csrf';
            opts.query = '_csrf';
            prefilter = createCsrfPrefilter(tokenValue, opts);
        });

        describe('and ajax request is unsafe', function() {

            it('should inject all specified options into request', function() {
                unsafeMethods.forEach(function(method) {
                    options.type = method;
                    options.url = '/some/url';
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.calledWith(opts.header, tokenValue));
                    assert.strictEqual(options.url, '/some/url?_csrf=' + tokenValue);
                    assert.strictEqual(JSON.parse(options.data)._csrf, tokenValue);
                    assert(!jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });

    describe('when prefilter created with safe methods specified', function() {

        beforeEach(function() {
            opts.ignoreMethods = ['OPTIONS', 'TRACE', 'HEAD'];
            prefilter = createCsrfPrefilter(tokenValue, opts);
        });

        describe('and ajax request is safe', function() {

            it('should not inject csrf token into request', function() {
                opts.ignoreMethods.forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.notCalled);
                });
            });
        });

        describe('and ajax request is unsafe', function() {

            it('should inject csrf token into request', function() {
                ['GET'].concat(unsafeMethods).forEach(function(method) {
                    options.type = method;
                    prefilter(options, originalOptions, jqXHR);
                    assert(jqXHR.setRequestHeader.calledWith('X-CSRF-Token', tokenValue));
                });
            });
        });
    });
});
