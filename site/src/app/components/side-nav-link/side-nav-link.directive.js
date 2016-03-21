(function() {
  'use strict';

  angular
    .module('gcloud')
    .directive('sideNavLink', sideNavLink);

  /** @ngInject */
  function sideNavLink($location, $state, $interpolate) {
    var url = $interpolate('#/docs/{{version}}{{href}}');

    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var href = url({
          version: $state.params.version,
          href: attrs.sideNavLink
        });

        elem.attr('href', href);
        scope.$watch(getPath, toggleClass);

        function getPath() {
          return $location.path();
        }

        function toggleClass(currentHref) {
          // Strip any method "anchor" that may follow the serviceId, and
          // prepend '#' to match href.
          currentHref = '#' + currentHref.replace(/[#\.].+$/, '');

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
