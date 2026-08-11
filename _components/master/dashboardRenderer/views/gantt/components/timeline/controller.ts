import { computed, inject } from 'vue'
import { Context } from '../../interface'
import { GANTT_CONTEXT, getTimelineBlocks } from '../../helper'

export default function controller(props: any, emit: any) {

  const context = inject<any>(GANTT_CONTEXT)

  const computeds = {
    blocks: computed(() => getTimelineBlocks(context.value as Context)),
  }

  const methods = {
    gridColumns: (columns: number) => ({
      gridTemplateColumns: `repeat(${columns}, var(--gantt-column-width))`,
    }),
  }

  return { ...computeds, ...methods }
}
