import mitt, { type Emitter } from 'mitt'
import type { IFormatDoodle } from '../hooks/useFormatDoodleList'
type Events = {
  'viewer-move': { viewerIns: Viewer; moveData: any }
  'viewer-zoom': { viewerIns: Viewer; zoomNum: number }
  'open-check-style': {
    viewerIns: Viewer
    options: { doodle: IFormatDoodle }
  }
}
export const emitter: Emitter<Events> = mitt<Events>()
