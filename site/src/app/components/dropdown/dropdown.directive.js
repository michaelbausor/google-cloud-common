(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('dropdown', dropdown);

  /** @ngInject */
  function dropdown() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/components/dropdown/dropdown.html',
      transclude: true,
      scope: {
        selected: '='
      },
      controller: DropdownCtrl,
      controllerAs: 'dropdown',
      bindToController: true
    };
  }

  /** @ngInject */
  function DropdownCtrl() {
    var dropdown = this;

    dropdown.isOpen = false;
  }
}());
