(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('moduleSwitcher', moduleSwitcher);

  /** @ngInject */
  function moduleSwitcher($stateParams, manifest, util) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/module-switcher/module-switcher.html',
      link: function(scope) {
        scope.modules = manifest.modules;

        scope.$watch($stateParams, function() {
          var module = util.findWhere(manifest.modules, {
            id: $stateParams.module
          });

          scope.selected = module.name;
        });
      }
    };
  }
}());
