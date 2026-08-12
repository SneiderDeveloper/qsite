import { computed, inject, toRefs } from 'vue'
import { Context } from '../../interface'
import { GANTT_CONTEXT, getOffset } from '../../helper'

export default function controller(props: any, emit: any) {

  const { date } = toRefs(props)

  const context = inject<any>(GANTT_CONTEXT)

  const DATE_FORMAT = 'MMM DD, YYYY'

  const computeds = {
    offset: computed(() => Math.round(getOffset(date.value, context.value as Context))),
    formattedDate: computed(() => date.value.format(DATE_FORMAT)),
  }

  return { ...computeds }
}
