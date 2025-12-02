import mitt, { type Emitter } from 'mitt'
type Events = {
  'viewer-move': { viewerIns: Viewer; moveData: any }
  'viewer-zoom': { viewerIns: Viewer; zoomNum: number }
  'open-check-style': {
    viewerIns: Viewer
    options: { doodleId: string }
  }
  'clear-check-style': { viewerIns: Viewer }
}
export const emitter: Emitter<Events> = mitt<Events>()
