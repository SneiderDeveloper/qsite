const moduleName = 'isite';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`
const urlBaseMedia = `/media/${moduleVersion}`;
export default {
  urlBase: urlBase,
  version: moduleVersion,
  settings: `${urlBase}/settings`,
  configs: `${urlBase}/configs`,
  appVersion: `${urlBase}/site/version`,
  siteSettings: `${urlBase}/site/settings`,
  permissions: `${urlBase}/site/permissions`,
  cacheClear: `${urlBase}/site/cache-clear`,
  export: `${urlBase}/export`,
  recommendations: `${urlBase}/recommendations`,
  icruds: `${urlBase}/icruds`,
  organizations: `${urlBase}/organizations`,
  domains: `${urlBase}/domains`,
  categories: `${urlBase}/categories`,
  modulesInfo: `${urlBase}/configs/modules-info`,
  layouts: `${urlBase}/layouts`,
  logs: `${urlBase}/logs`,
  synchronizables: `${urlBase}/synchronizables`,
  generateFile: `${urlBase}/synchronizables/generate-spread-sheet`,
  sync: `${urlBase}/synchronizables/sync`,
  bulkActions: `${urlBase}/bulk-actions`,
  favourites: `${urlBase}/favourites`,
  filesUploadWithDetails: `${urlBaseMedia}/files/upload-with-details`,
  files: `${urlBaseMedia}/files`,
  cruds: `${urlBase}/cruds`,
  zone: `${urlBaseMedia}/zones`,
  appContexts: `${urlBase}/app-contexts`,
};
