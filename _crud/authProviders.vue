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
        apiRoute: 'apiRoutes.qsite.authProviders',
        // permission: 'isite.app-contexts',
        create: {
          title: 'Auth providers',
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
              name: 'actions',
              label: 'Actions',
              align: 'left',
            },
          ],
          filters: {},
          actions: [],
        },

        update: {
          title: 'Update Auth Provider',
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

          status: {
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
        },
        formRight: {
          options: {
            value: [],
            type: 'json',
            props: {
              label: 'Options',
              type: 'textarea',
              hint: 'One setting per line or JSON array',
            },
          },
        },
      };
    },
  },
};
</script>
