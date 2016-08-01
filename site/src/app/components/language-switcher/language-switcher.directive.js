(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('languageSwitcher', languageSwitcher);

  /** @ngInject */
  function languageSwitcher(langs, manifest) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/language-switcher/language-switcher.html',
      link: function(scope) {
        scope.langs = langs;
        scope.modules = manifest.modules;
      }
    };
  }
}());
