(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('customType', customType);

  /** @ngInject */
  function customType($state) {
    var convertToServicePath = function(customType, method) {
      var stateName = 'docs.service';
      var stateParams = {
        serviceId: customType,
        version: $state.params.version
      };
      var stateOptions = { inherit: false };

      if (method) {
        stateParams.method = method;
      }

      return $state.href(stateName, stateParams, stateOptions);
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
        elem.addClass('skip-external-link')
          .attr('href', convertToServicePath(customType.replace('[]', ''), method));
      }
    };
  }

}());
