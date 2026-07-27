import pages from 'src/setup/pages'

//Places
export default [
  {
    title: 'isite.cms.sidebar.adminGroup',
    icon: 'fal fa-chess-rook',
    children: [
      pages.qsite.categories, //organization categories
      pages.qsite.icruds, //Cruds
      pages.qsite.layouts,
    ],
  },
  pages.qsite.organizationsAll, //organizations
  pages.qsite.organizations, //organizations
  pages.qsite.index, //setup
  pages.qsite.auditLog,
  pages.qsite.dynamicCruds,
  pages.qsite.appContexts,
];
