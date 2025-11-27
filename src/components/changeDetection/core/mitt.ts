import mitt, { type Emitter } from 'mitt'
type Events = {
  'viewer-move': { viewerIns: Viewer; moveData: any }
  'viewer-zoom': { viewerIns: Viewer; zoomNum: number }
}
export const emitter: Emitter<Events> = mitt<Events>()
