(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('sideNavLink', sideNavLink);

  /** @ngInject */
  function sideNavLink($location, $state, $interpolate) {
    var url = $interpolate('#/docs/{{package}}/{{version}}{{href}}');

    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var href = url({
          package: $state.params.package || '',
          version: $state.params.version,
          href: attrs.sideNavLink
        }).replace('//', '/');

        elem.attr('href', href);
        scope.$watch(getPath, toggleClass);

        function getPath() {
          return $location.path();
        }

        function toggleClass(currentHref) {
          currentHref = '#' + currentHref;

          if (currentHref === href) {
            elem.addClass('current');
            return;
          }

          elem.removeClass('current');
        }
      }
    };
  }

}());
