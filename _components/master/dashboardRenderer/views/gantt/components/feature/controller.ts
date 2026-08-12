import { computed, inject, toRefs } from 'vue'
import { Context } from '../../interface'
import { GANTT_CONTEXT, getOffset, getWidth } from '../../helper'

export default function controller(props: any, emit: any) {

  const { feature } = toRefs(props)

  const context = inject<any>(GANTT_CONTEXT)

  const DATE_FORMAT = 'MMM DD, YYYY'

  const computeds = {
    offset: computed(() => (
      Math.round(getOffset(feature.value.startAt, context.value as Context))
    )),
    width: computed(() => (
      Math.round(getWidth(feature.value.startAt, feature.value.endAt, context.value as Context))
    )),
    color: computed(() => feature.value?.status?.color || null),
    tooltip: computed(() => {
      if (feature.value?.tooltip) return feature.value.tooltip

      const startAt = feature.value.startAt.format(DATE_FORMAT)
      const endAt = feature.value.endAt?.format(DATE_FORMAT)
      const range = endAt ? `${startAt} - ${endAt}` : startAt

      return `${feature.value.name} · ${range}`
    }),
  }

  return { ...computeds }
}
