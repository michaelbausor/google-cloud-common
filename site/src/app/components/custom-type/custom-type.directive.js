(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('customType', customType);

  /** @ngInject */
  function customType($state, util) {
    var convertToServicePath = function(scope, customType, method) {
      var isInclusive = !!util.findWhere(scope.docs.types, {
        id: customType
      });

      var href = [
        '#',
        'docs'
      ];

      if (isInclusive) {
        var params = [
          $state.params.version,
          customType
        ];

        if ($state.params.module) {
          params.unshift($state.params.module);
        }

        href = href.concat(params);
      } else {
        href.push(customType);
      }

      href = href.join('/');

      if (method) {
        href += '?method=' + method;
      }

      return href;
    };

    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var customType = attrs.customType;
        var method = attrs.method;

        if (elem.html().length === 0) {
          // Set narrowest scope as text if no text in element
          elem.html(method ? method : customType);
        }

        var href = convertToServicePath(scope, customType.replace('[]', ''), method);
        elem.addClass('skip-external-link').attr('href', href);
      }
    };
  }

}());
