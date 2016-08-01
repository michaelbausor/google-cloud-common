(function() {
  'use strict';

  angular
    .module('gcloud')
    .config(docsRoutes);

  /** @ngInject */
  function docsRoutes($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, manifest) {
    // source: https://github.com/sindresorhus/semver-regex
    var regSemver = '\\bv?(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)(?:-[\\da-z\-]+(?:\\.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:\\.[\\da-z\\-]+)*)?\\b';
    var regPackage = '(?!master|\\d).*';

    var baseUrl = [
      '/docs',
      '{module:' + regPackage + '}',
      '{version:master|' + regSemver + '}'
    ].join('/');

    var latestCoreVersion;

    if (manifest.versions) {
      latestCoreVersion = manifest.versions[0];
    } else if (manifest.modules) {
      latestCoreVersion = manifest.modules[0].latestVersion;
    } else {
      throw new Error('Either "versions" or "modules" must be set.');
    }

    $urlMatcherFactoryProvider.type('nonURIEncoded', {
      encode: toString,
      decode: toString,
      is: function() { return true; }
    });

    $stateProvider
      .state('docs', {
        // ui-router allows one to optionally use a regular expressions to
        // match uri parameters against. In this instance we're only allowing
        // the version value to be "master" OR a valid semver version.
        // If we receive a route that does NOT match one of these two values
        // then we'll end up in the $urlRouterProvier.otherwise(...) block
        // which will look for version alias's or the absense of a version
        // and redirect the user appropriately
        url: baseUrl,
        templateUrl: 'app/docs/docs.html',
        controller: 'DocsCtrl',
        controllerAs: 'docs',
        abstract: true,
        resolve: {
          lastBuiltDate: getLastBuiltDate,
          toc: getToc,
          types: getTypes,
          versions: getVersions
        },
        params: {
          version: 'latest',
          module: {
            value: null,
            squash: true
          }
        }
      })
      .state('docs.guides', {
        url: '/guides/:guideId?section',
        templateUrl: 'app/guide/guide.html',
        controller: 'GuideCtrl',
        controllerAs: 'guide',
        resolve: {
          guideObject: getGuide
        }
      })
      .state('docs.service', {
        url: '/{serviceId:nonURIEncoded}?method',
        templateUrl: 'app/service/service.html',
        controller: 'ServiceCtrl',
        controllerAs: 'service',
        resolve: {
          serviceObject: getService
        }
      });

    $urlRouterProvider.when('/docs', '/docs/latest');

    // since /docs/:module/:version is an abstract state, it can't actually
    // be transitioned to. In the event a user tries to navigate to this
    // page, we'll find the default service for it and redirect the user there.
    $urlRouterProvider.when(baseUrl, function($match, $state, manifest, util) {
      if (!manifest.modules) {
        return manifest.defaultService || 'gcloud';
      }

      var module = util.findWhere(manifest.modules, {
        id: $match.module
      });

      $match.serviceId = module.defaultService;

      return $state.go('docs.service', $match);
    });

    // begin redirect-mania!
    $urlRouterProvider.otherwise(function($injector, $location) {
      var homeRoute = '/';
      var path = $location.path();
      var docsBaseUrl = '/docs/';
      var isUnknownRoute = path.indexOf(docsBaseUrl) === -1;

      // no idea where they were trying to go.. lets go to the home page
      if (isUnknownRoute) {
        return homeRoute;
      }

      var params = path.replace(docsBaseUrl, '').split('/');
      var module;

      if (manifest.modules) {
        module = $injector.get('util').findWhere(manifest.modules, {
          id: params[0]
        });
      }

      if (module) {
        params.splice(0, 1);
        docsBaseUrl += module.id + '/';
      }

      var versions = module ? module.versions : manifest.versions;

      // if we can't confirm the version, let's just go to the home page..
      if (!versions) {
        return homeRoute;
      }

      var version = params[0];
      var isValidVersion = versions.indexOf(version) !== -1;

      // if we can confirm the version, maybe the service id is bad.. so
      // we'll head to the default service docs
      if (isValidVersion) {
        return docsBaseUrl + version;
      }

      var latestVersion = versions[0];

      // check for a version alias
      if (version === 'latest' || version === 'stable') {
        params[0] = latestVersion;
      } else {
        // otherwise let's assume the version was omitted altogether
        params.unshift($injector.get('$stateParams').version || latestVersion);
      }

      // being anew!
      return docsBaseUrl + params.join('/');
    });
  }

  /** @ngInject */
  function getLastBuiltDate($http, manifest) {
    var url = 'https://api.github.com/repos/GoogleCloudPlatform/gcloud-' +
      manifest.lang + '/commits?sha=gh-pages&per_page=1';

    return $http({
      method: 'get',
      url: url,
      cache: true
    })
    .then(function(resp) {
      return resp.data[0].commit.committer.date;
    })
    .then(null, angular.noop);
  }

  /** @ngInject */
  function getToc($interpolate, $http, $stateParams, manifest) {
    var tocUrl = $interpolate('{{content}}/{{module}}/{{version}}/toc.json')({
      content: manifest.content,
      module: $stateParams.module || manifest.defaultPackage,
      version: $stateParams.version
    });

    return $http.get(tocUrl).then(function(response) {
      return response.data;
    });
  }

  /** @ngInject */
  function getTypes($interpolate, $http, $stateParams, manifest) {
    var types = $interpolate('{{content}}/{{module}}/{{version}}/types.json')({
      content: manifest.content,
      module: $stateParams.module || manifest.defaultPackage,
      version: $stateParams.version
    });

    return $http.get(types).then(function(response) {
      return response.data;
    });
  }

  /** @ngInject */
  function getGuide($q, $stateParams, util, toc) {
    var guideId = $stateParams.guideId.replace(/\-/g, ' ');
    var guide = util.findWhere(toc.guides, { id: guideId });

    if (!guide) {
      return $q.reject('Unknown guide: ' + guideId);
    }

    return guide;
  }

  /** @ngInject */
  function getService($stateParams, $interpolate, $http, $q, manifest, types, util) {
    var serviceId = $stateParams.serviceId;
    var service = util.findWhere(types, {
      id: serviceId
    });

    if (!service) {
      // make sure if unknown service happens we redirect properly..
      return $q.reject('Unknown service: ' + serviceId);
    }

    var moduleName = $stateParams.module || '';

    // for modular docs the resource would be something simple like "job.json"
    // where as for non-modular it would be "bigquery/job.json"
    var json = $interpolate('{{content}}/{{module}}/{{version}}/{{json}}')({
      content: manifest.content,
      version: $stateParams.version,
      json: service.contents,
      module: moduleName
    });

    return $http.get(json).then(function(response) {
      var data = response.data;

      if (service.title) {
        data.title = service.title;
      }

      return data;
    });
  }

  /** @ngInject */
  function getVersions(manifest, $stateParams, util, $q) {
    if (!manifest.modules) {
      if (manifest.versions) {
        return manifest.versions;
      }

      return $q.reject('"versions" field missing from manifest.json');
    }

    var moduleName = $stateParams.module;
    var module = util.findWhere(manifest.modules, {
      id: moduleName
    });

    if (!module) {
      return $q.reject('Unknown module "' + moduleName + '"');
    }

    return module.versions;
  }

  function toString(val) {
    return val ? val.toString() : null;
  }

}());
