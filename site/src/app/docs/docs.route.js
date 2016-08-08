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

    var baseUrl = '/docs/' +
      (manifest.modules ? '{module:' + regPackage + '}/' : '') +
      '{version:master|' + regSemver + '}';

    var latestCoreVersion;

    if (manifest.versions) {
      latestCoreVersion = manifest.versions[0];
    } else if (manifest.modules) {
      latestCoreVersion = manifest.modules[0].versions[0];
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
          module: manifest.defaultModule
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

    // begin redirect-mania!
    $urlRouterProvider.otherwise(function($injector, $location) {
      var path = $location.path();
      var docsBaseUrl = '/docs/';
      var isUnknownRoute = path.indexOf(docsBaseUrl) === -1;

      // no idea where they were trying to go.. lets go to the home page
      if (isUnknownRoute) {
        return '/';
      }

      var params = path.replace(docsBaseUrl, '').split('/');
      var route = docsBaseUrl;

      if (manifest.modules) {
        route += getDefaultModuleRoute(params, manifest, $injector);
      } else {
        route += getDefaultRoute(params, manifest, $injector);
      }

      return route;
    });
  }

  /** @ngInject */
  function getLastBuiltDate($http, manifest) {
    var url = 'https://api.github.com/repos/GoogleCloudPlatform/' +
      manifest.moduleName + '/commits?sha=gh-pages&per_page=1';

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
      module: $stateParams.module || manifest.defaultModule,
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
      module: $stateParams.module || manifest.defaultModule,
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

  function getDefaultModuleRoute(params, manifest, $injector) {
    var module = $injector.get('util').findWhere(manifest.modules, {
      id: params[0]
    });

    // it's a bad module? let's try the default module
    if (!module) {
      params.unshift(manifest.defaultModule);
      return params.join('/');
    }

    // could be a version alias
    if (params[1] === 'latest' || params[1] === 'stable') {
      params[1] = module.versions[0];
      return params.join('/');
    }

    var moduleId = params.shift();
    var isValidVersion = module.versions.indexOf(params[0]) > -1;

    // maybe it's a bad version? let's try the latest
    if (!isValidVersion) {
      return [moduleId, module.versions[0], moduleId].concat(params).join('/');
    }

    var version = params.shift();

    // if it's not a bad module or version, then likely the service is bad
    // so we'll go to the default service
    return [moduleId, version, module.defaultService].join('/');
  }

  function getDefaultRoute(params, manifest) {
    if (params[0] === 'latest' || params[0] === 'stable') {
      params[0] = manifest.versions[0];
      return params.join('/');
    }

    var isValidVersion = manifest.versions.indexOf(params[0]) > -1;

    // could be a bad version number..
    if (!isValidVersion) {
      params.unshift(manifest.versions[0]);
      return params.join('/');
    }

    var version = params.shift();

    // not a bad version number..? Then perhaps a bad service
    return [version, manifest.defaultService || 'gcloud'].join('/');
  }

}());
