export default {
  organizations: {
    activated: true,
    path: '/site/my-organizations',
    name: 'qsite.panel.organizations.index',
    page: () => import('@imagina/qsite/_pages/panel/organizationCheck.vue'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'isite.cms.sidebar.adminOrganization',
    icon: 'fal fa-crown',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  },
}
