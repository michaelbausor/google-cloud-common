(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('pageHeader', pageHeader);

  /** @ngInject */
  function pageHeader(manifest) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/page-header/page-header.html',
      replace: true,
      transclude: true,
      scope: {
        title: '='
      },
      link: function(scope) {
        scope.title = scope.title || manifest.friendlyLang;

        if (angular.isArray(scope.title)) {
          scope.title = scope.title.join(manifest.titleDelimiter || ' » ');
        }
      }
    };
  }
}());
