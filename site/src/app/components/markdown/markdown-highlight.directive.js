(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('pre', markdownHighlight);

  /** @ngInject */
  function markdownHighlight(hljs) {
    return {
      restrict: 'E',
      link: function(scope, elem) {
        if (elem.hasClass('skip-highlight')) {
          return;
        }

        var codeBlocks = elem.children('code');

        if (!codeBlocks.length) {
          return;
        }

        var unwatch = scope.$watch(highlight);

        function highlight() {
          angular.forEach(codeBlocks, hljs.highlightBlock, hljs);
          unwatch();
        }
      }
    };
  }

}());
