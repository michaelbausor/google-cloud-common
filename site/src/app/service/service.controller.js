(function() {
  'use strict';

  angular
    .module('gcloud')
    .controller('ServiceCtrl', ServiceCtrl);

  /** @ngInject */
  function ServiceCtrl($scope, $state, DeeplinkService, DocsService, serviceObject) {
    var service = this;

    angular.extend(service, DocsService.setAsTrusted(serviceObject));

    service.methods = serviceObject.methods
      .map(DocsService.setAsTrusted)
      .sort(sortMethods);

    service.methodNames = service.methods.map(getName);
    service.showGettingStarted = false;

    $scope.$on('$viewContentLoaded', watchMethod);

    function getName(method) {
      return method.name;
    }

    function watchMethod() {
      return DeeplinkService.watch($scope, getAnchor);
    }

    function getAnchor() {
      var serviceId = $state.params && $state.params.serviceId;
      // Only return anchor if serviceId is for a method in the service, not the
      // service itself). If so, the method's id will be an anchor in the page.
      if (serviceId !== service.id) {
        return serviceId;
      }
    }

    function sortMethods(a, b) {
      if (a.type === 'constructor') {
        return -1;
      }

      if (b.type === 'constructor') {
        return 1;
      }

      return +(a.name > b.name) || +(a.name === b.name) - 1;
    }
  }
}());
