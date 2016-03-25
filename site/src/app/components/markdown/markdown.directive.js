(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('markdown', markdown);

  /** @ngInject */
  function markdown($compile, markdownConverter) {
    return {
      restrict: 'E',
      link: function(scope, elem) {
        var unwatch = scope.$on('$includeContentLoaded', compile);

        function compile() {
          var html = markdownConverter.makeHtml(elem.text());
          var node = angular.element(html);

          elem.html('').append(node);
          $compile(elem.contents())(scope);
          unwatch();
        }
      }
    };
  }

}());
