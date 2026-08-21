import { computed, toRefs } from 'vue'
import { i18n } from 'src/plugins/utils.ts'
import { TimelineRow } from '../../interface'
import { getDuration } from '../../helper'

export default function controller(props: any, emit: any) {

  const { labels } = toRefs(props)

  const computeds = {
    nameLabel: computed(() => labels.value?.name || i18n.tr('isite.cms.form.name')),
    durationLabel: computed(() => (
      labels.value?.duration || i18n.tr('isite.cms.label.duration')
    )),
    emptyLabel: computed(() => labels.value?.empty || i18n.tr('isite.cms.label.empty')),
  }

  const methods = {
    duration: (row: TimelineRow) => getDuration(row.startAt, row.endAt),
    rowHeight: (row: TimelineRow) => ({
      height: `calc(var(--gantt-row-height) * ${row.subRows})`,
    }),
  }

  return { ...computeds, ...methods }
}
