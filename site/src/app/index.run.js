(function() {
  'use strict';

  angular
    .module('gcloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($state, $rootScope, manifest) {
    if (!manifest.moduleName) {
      manifest.moduleName = 'gcloud-' + manifest.lang;
    }

    angular.extend($rootScope, manifest);

    $rootScope.$on('$stateChangeError', function() {
      // uncomment for debugging
      // console.log(arguments);

      $state.go('docs.service', {
        version: $state.params.version,
        serviceId: manifest.defaultService || 'gcloud'
      });
    });
  }

}());
