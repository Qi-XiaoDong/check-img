import mitt, { type Emitter } from 'mitt'
import type { IDoodle } from '@/components/changeDetection/hooks/useFormatDoodleList'

type Events = {
  'viewer-move': { viewerIns: Viewer; moveData: any }
  'viewer-zoom': { viewerIns: Viewer; zoomNum: number }
  'open-check-style': {
    viewerIns: Viewer
    options: { doodleId: string }
  }
  'clear-check-style': { viewerIns: Viewer }
  'add-detect-target': { viewerIns: Viewer; options: IDoodle; callback: (result: string) => void }
  'update-detect-target': { viewerIns: Viewer; options: IDoodle }
  'delete-detect-target': { viewerIns: Viewer; ids: string[] }
  'draw-rect-active': { id?: string }
}
export const emitter: Emitter<Events> = mitt<Events>()
