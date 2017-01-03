(function() {
  'use strict';

  angular
    .module('gcloud')
    .controller('DocsCtrl', DocsCtrl);

  /** @ngInject */
  function DocsCtrl($state, langs, manifest, toc, types, lastBuiltDate, versions) {
    var docs = this;

    docs.libraryTitle = manifest.libraryTitle || 'Google Cloud';
    docs.langs = langs;
    docs.lastBuiltDate = lastBuiltDate;
    docs.guides = toc.guides;
    docs.services = toc.services;
    docs.versions = versions;
    docs.version = $state.params.version;
    docs.tagName = toc.tagName || docs.version;
    docs.overviewFileUrl = null;
    docs.types = types;

    docs.selectedVersion = docs.version;
    docs.loadVersion = loadVersion;
    docs.getGuideUrl = getGuideUrl;
    docs.isActive = isActive;

    if (toc.overview) {
      docs.overviewFileUrl = [
        manifest.content,
        $state.params.module,
        $state.params.version,
        toc.overview
      ].join('/');
    }

    function loadVersion(version) {
      return $state.go($state.current.name, { version: version });
    }

    function isActive(service) {
      var serviceId = service.type;
      var serviceIdParam = $state.params.serviceId || '';

      // Match the first element in the serviceId. E.g., nav parent
      // `datastore/client` matches `datastore` extracted from nav child
      // `datastore/query`.
      if (manifest.matchPartialServiceId) {
        var partialServiceId = serviceId.split('/')[0];
        return !!serviceIdParam.match(partialServiceId);

      // Match the downcase service title to any part of the serviceIdParam,
      // E.g., both nav parent `google/cloud/datastore` and nav child
      // `google/datastore/v1` match the title `datastore`.
      } else if (manifest.matchServiceTitle)  {
        var parts = serviceIdParam.split('/');
        return parts.indexOf(service.title.toLowerCase()) >= 0;
      }

      // Strictly match. E.g., `datastore/query` matches `datastore`.
      return !!serviceIdParam.match(serviceId);
    }

    function getGuideUrl(page) {
      return page.title.toLowerCase().replace(/\s/g, '-');
    }
  }
}());
