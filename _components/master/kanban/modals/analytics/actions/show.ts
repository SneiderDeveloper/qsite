import Vue from 'vue';
import store from '../store/index'
export default async function showAnalytics(criteria: string = 'leadsByStatus') {
    try {
        const filters = {
            date: {
            "field": "created_at",
            "type": store.filterDate,
            "from": store.from,
            "to": store.to
            }
        }
        store.loading = true;
        const response = await Vue.prototype.$crud.show("apiRoutes.qrequestable.analytics", criteria, {
            refresh: true,
            params: {
                filter: { ...filters }
            }
        })
        store.chartsData = response.data;
        store.loading = false;
    } catch (error) {
        console.log(error);
        return { data: {} }
    }
}