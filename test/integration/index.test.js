'use strict';

var $ = require('jquery'),
    assert = require('assert'),
    sinon = require('sinon'),
    createCsrfPrefilter = require('../..');

describe('Requests prefiltered with CSRF token injection', function() {
    var xhr, requests, prefilter, prefilters = $.Callbacks();

    $.ajaxPrefilter(prefilters.fire);

    describe('POST with header prefilter', function() {

        beforeEach(function() {
            prefilter = createCsrfPrefilter('my-token-value');
            prefilters.add(prefilter);
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function(req) { requests.push(req); };

            $.ajax({
                type: 'POST',
                url: '/some/url',
                dataType: 'json',
                data: {
                    foo: 'bar',
                    baz: 'qux'
                }
            });
        });

        afterEach(function() {
            xhr.restore();
            prefilters.remove(prefilter);
        });

        it('should inject expected header', function() {
            assert.strictEqual(requests[0].requestHeaders['X-CSRF-Token'], 'my-token-value');
        });
    });

    describe('POST with data prefilter and application/json content-type', function() {

        beforeEach(function() {
            prefilter = createCsrfPrefilter('my-token-value', {
                data: '_csrf'
            });
            prefilters.add(prefilter);
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function(req) { requests.push(req); };

            $.ajax({
                type: 'POST',
                url: '/some/url',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    foo: 'bar',
                    baz: 'qux'
                })
            });
        });

        afterEach(function() {
            xhr.restore();
            prefilters.remove(prefilter);
        });

        it('should inject expected header', function() {
            var requestBody = JSON.parse(requests[0].requestBody);
            assert.strictEqual(requestBody._csrf, 'my-token-value');
        });
    });

    describe('POST with data prefilter and application/x-www-form-urlencoded content-type', function() {

        beforeEach(function() {
            prefilter = createCsrfPrefilter('my-token-value', {
                data: '_csrf'
            });
            prefilters.add(prefilter);
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function(req) { requests.push(req); };

            $.ajax({
                type: 'POST',
                url: '/some/url',
                dataType: 'json',
                data: {
                    foo: 'bar',
                    baz: 'qux'
                }
            });
        });

        afterEach(function() {
            xhr.restore();
            prefilters.remove(prefilter);
        });

        it('should inject expected header', function() {
            assert.strictEqual(requests[0].requestBody, 'foo=bar&baz=qux&_csrf=my-token-value');
        });
    });

    describe('POST with query prefilter', function() {

        beforeEach(function() {
            prefilter = createCsrfPrefilter('my-token-value', {
                query: '_csrf'
            });
            prefilters.add(prefilter);
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function(req) { requests.push(req); };

            $.ajax({
                type: 'POST',
                url: '/some/url',
                dataType: 'json',
                data: {
                    foo: 'bar',
                    baz: 'qux'
                }
            });
        });

        afterEach(function() {
            xhr.restore();
            prefilters.remove(prefilter);
        });

        it('should inject expected header', function() {
            assert.strictEqual(requests[0].url, '/some/url?_csrf=my-token-value');
        });
    });
});
