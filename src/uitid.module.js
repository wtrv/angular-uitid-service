'use strict';

/**
 * @ngdoc function
 * @name cultuurnet.module: Uitid
 * @description
 * # uitid service
 * Service to connect with the silex uitid provider.
 */
angular
  .module('cultuurnet.uitid', [])
  .service('uitidService', uitidService);

/* @ngInject */
function uitidService($q, $window, $http, appConfig) {

  var apiUrl = appConfig.apiUrl + 'uitid';
  var authUrl = appConfig.apiUrl + 'culturefeed/oauth/connect';
  /*jshint validthis: true */
  var uitId = this;

  uitId.user = undefined;

  /**
   * @returns {Promise}
   *   A promise with the credentials of the currently logged in user.
   */
  uitId.getUser = function() {
    var deferredUser = $q.defer();

    if (uitId.user) {
      deferredUser.resolve(uitId.user);
    } else {
      $http
        .get(apiUrl + '/user')
        .success(angular.bind(uitId, function (userData) {
          uitId.user = userData;
          uitId.user.displayName = uitId.user.givenName || uitId.user.nick;

          deferredUser.resolve(userData);
        }))
        .error(function () {
          deferredUser.reject();
        });
    }

    return deferredUser.promise;
  };

  /**
   * @returns {Promise}
   *   A promise with the login status (true or false).
   */
  uitId.getLoginStatus = function() {
    var deferredStatus = $q.defer();

    uitId
      .getUser()
      .then(
        function () {
          deferredStatus.resolve(true);
        },
        function () {
          deferredStatus.resolve(false);
        }
      );

    return deferredStatus.promise;
  };

  /**
   * Login by redirecting to UiTiD
   */
  uitId.login = function(destination) {
    // redirect to login page
    authUrl += '?destination=' + destination;
    $window.location.href = authUrl;
  };

  /**
   * @returns {Promise}
   *   A promise with no additional data.
   */
  uitId.logout = function() {
    var deferredLogout = $q.defer();

    $http
      .get(apiUrl + '/logout')
      .then(angular.bind(uitId, function() {
        uitId.user = undefined;
        deferredLogout.resolve();
      }));

    return deferredLogout.promise;
  };
}
