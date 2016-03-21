(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('customType', customType);

  /** @ngInject */
  function customType($state) {
    var convertToServicePath = function(customType) {
      var stateName = 'docs.service';
      var stateParams = {
        serviceId: customType,
        version: $state.params.version
      };
      var stateOptions = { inherit: false };

      return $state.href(stateName, stateParams, stateOptions);
    };

    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var customType = attrs.customType;
        if (elem.html().length === 0) {
          elem.html(customType); // Set path as text if no text in element
        }
        elem.addClass('skip-external-link')
          .attr('href', convertToServicePath(customType.replace('[]', '')));
      }
    };
  }

}());
