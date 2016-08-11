(function() {
  'use strict';

  angular
    .module('gcloud')
    .controller('HomeCtrl', HomeCtrl);

  /** @ngInject */
  function HomeCtrl(manifest, latestRelease, util) {
    var home = this;

    home.contentUrl = [manifest.content, manifest.home].join('/');
    home.latestRelease = latestRelease;

    if (!manifest.modules) {
      return;
    }

    var module = util.findWhere(manifest.modules, {
      id: manifest.defaultModule
    });

    home.module = {
      name: module.id,
      version: module.versions[0],
      service: module.defaultService
    };
  }

}());
