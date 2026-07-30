<template></template>

<script>
export default {
  data() {
    return {
      crudId: this.$uid(),
    };
  },

  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: 'apiRoutes.qsite.appContexts',
        permission: 'isite.app-contexts',
        create: {
          title: 'New App Context',
        },

        read: {
          columns: [
            {
              name: 'id',
              label: 'Id',
              field: 'id',
              align: 'left',
            },
            {
              name: 'name',
              label: 'Name',
              field: 'name',
              align: 'left',
            },
            {
              name: 'alias',
              label: 'Alias',
              field: 'alias',
              align: 'left',
            },
            {
              name: 'description',
              label: 'Description',
              field: 'description',
              align: 'left',
            },
            {
              name: 'version',
              label: 'Version',
              field: 'version',
              align: 'left',
            },
            {
              name: 'isActive',
              label: 'Active',
              field: 'isActive',
              align: 'left',
            },
            {
              name: 'appleHtmlCallback',
              label: 'Apple Callback',
              field: 'appleHtmlCallback',
              align: 'left',
            },
            {
              name: 'actions',
              label: 'Actions',
              align: 'left',
            },
          ],

          filters: {},

          actions: [],
          requestParams: { include: 'authProviders' },
        },

        update: {
          title: 'Update App Context',
          requestParams: { include: 'authProviders' },
        },

        delete: true,

        formLeft: {
          name: {
            value: null,
            type: 'input',
            props: {
              label: 'Name',
              rules: [
                (val) => !!val || this.$tr('isite.cms.message.fieldRequired'),
              ],
            },
          },

          alias: {
            value: null,
            type: 'input',
            props: {
              label: 'Alias',
              rules: [
                (val) => !!val || this.$tr('isite.cms.message.fieldRequired'),
              ],
            },
          },

          description: {
            value: null,
            type: 'input',
            props: {
              label: 'Description',
            },
          },

          version: {
            value: null,
            type: 'input',
            props: {
              label: 'Version',
            },
          },

          isActive: {
            value: true,
            type: 'select',
            props: {
              label: 'is Active',
              options: [
                {
                  label: 'Enabled',
                  value: true,
                },
                {
                  label: 'Disabled',
                  value: false,
                },
              ],
            },
          },

          appleHtmlCallback: {
            value: null,
            type: 'input',
            props: {
              label: 'Apple HTML Callback',
            },
          },
          authProviders: {
            value: [],
            type: 'select',
            props: {
              label: 'Auth Providers',
              multiple: true,
              useInput: true,
              useChips: true,
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qsite.authProviders',
              select: {
                id: 'id',
                label: 'name',
              },
            },
          },
        },
        formRight: {
          settings: {
            value: [],
            type: 'json',
            props: {
              label: 'Settings',
              type: 'textarea',
              hint: 'One setting per line or JSON array',
            },
          },

          permissions: {
            value: {},
            type: 'permissions',
          },

          configs: {
            value: null,
            type: 'input',
            props: {
              label: 'Configs',
              type: 'textarea',
            },
          },
        },
      };
    },
  },
};
</script>
