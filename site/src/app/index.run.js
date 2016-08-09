(function() {
  'use strict';

  angular
    .module('gcloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($state, $rootScope, $timeout, manifest, util) {
    if (!manifest.moduleName) {
      manifest.moduleName = 'gcloud-' + manifest.lang;
    }

    angular.extend($rootScope, manifest);

    $rootScope.$on('$stateChangeError', function() {
      // uncomment for debugging
      // console.log(arguments);

      var moduleId = $state.params.module || manifest.defaultModule;

      if (!moduleId && manifest.modules) {
        moduleId = manifest.modules[0].id;
      }

      var module;

      if (moduleId) {
        module = util.findWhere(manifest.modules, {
          id: moduleId
        });
      }

      var version = (module ? module : manifest).versions[0];
      var serviceId = (module ? module : manifest).defaultService || 'gcloud';

      $state.go('docs.service', {
        module: moduleId,
        version: version,
        serviceId: serviceId
      });
    });
  }

}());
