'use strict';

describe('Service: uitid', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('cultuurnet.uitid', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
    var $window = { location: { href: '' } };
    $provide.value('$window', $window);
  }));

  // Instantiate service.
  var uitid, $httpBackend, $window;

  beforeEach(inject(function ($injector, _uitidService_) {
    $httpBackend = $injector.get('$httpBackend');
    $window = $injector.get('$window');
    uitid = _uitidService_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('returns user data from the server and caches it', function() {
    // Mock an HTTP response.
    $httpBackend
      .expectGET(apiUrl + 'uitid/user')
      .respond(200, '{"id":"1","nick":"Foo", "givenName": "Dirk"}');

    // Assertion method.
    var assertUserData = function(user) {
      expect(user).toEqual({
        id: '1',
        nick: 'Foo',
        givenName: 'Dirk',
        displayName: 'Dirk'
      });
    };

    // Request the user data and assert it when its returned.
    uitid.getUser().then(assertUserData);

    // Deliver the HTTP response so the user data is asserted.
    $httpBackend.flush();

    // Request the user data and assert it again, but this time without
    // mocking an HTTP request as the user object should have been cached.
    uitid.getUser().then(assertUserData);
  });

  it('rejects the promise of user data if no user is logged in', function() {
    // Mock an unauthorized response.
    $httpBackend
      .expectGET(apiUrl + 'uitid/user')
      .respond(403, 'Access denied');

    // Request the user data, and make the test fail if the promise is not rejected
    // but resolved.
    uitid.getUser().then(
      function() {
        throw new Error('uitid.getUser() should not have resolved its promise.');
      }
    );

    // Deliver the 403 response.
    $httpBackend.flush();
  });

  it('determines the login status', function() {
    // Mock a 403 response.
    $httpBackend
      .expectGET(apiUrl + 'uitid/user')
      .respond(403, 'Access denied');

    // Request the login status, and make sure that its false.
    uitid.getLoginStatus().then(function(status) {
      expect(status).toBe(false);
    });

    // Deliver the 403 response.
    $httpBackend.flush();

    // Mock a response with user data.
    $httpBackend
      .expectGET(apiUrl + 'uitid/user')
      .respond(200, '{"id":"1","nick":"foo"}');

    // Request the login status again, this time making sure its true.
    uitid.getLoginStatus().then(function(status) {
      expect(status).toBe(true);
    });

    // Deliver the response with user data.
    $httpBackend.flush();

    // Request the login status yet again, this time without mocking an HTTP response
    // as the user data should have been cached.
    uitid.getLoginStatus().then(function(status) {
      expect(status).toBe(true);
    });
  });

  it('logs the user out on the backend', function() {
    $httpBackend
      .expectGET(apiUrl + 'uitid/logout')
      .respond(200, 'Logged out');

    uitid.logout();

    $httpBackend.flush();
  });

  it('redirects the user after login', function () {
    var destination = 'destination';

    uitid.login(destination);

    expect($window.location.href).toEqual(apiUrl + 'culturefeed/oauth/connect?destination=' + destination);
  });
});
