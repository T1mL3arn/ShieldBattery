import { TypedIpcRenderer } from '../../common/ipc'
import { LocalSettingsData, ScrSettingsData } from '../../common/local-settings'
import { LOCAL_SETTINGS_SET_BEGIN, SCR_SETTINGS_SET_BEGIN } from '../actions'
import { ThunkAction } from '../dispatch-registry'

const ipcRenderer = new TypedIpcRenderer()

export function mergeLocalSettings(settings: Partial<LocalSettingsData>): ThunkAction {
  return dispatch => {
    dispatch({
      type: LOCAL_SETTINGS_SET_BEGIN,
    } as any)

    // the ipc-handler will dispatch the right UPDATE event (or SET, if there was an error)
    ipcRenderer.send('settingsLocalMerge', settings)
  }
}

export function mergeScrSettings(settings: Partial<ScrSettingsData>): ThunkAction {
  return dispatch => {
    dispatch({
      type: SCR_SETTINGS_SET_BEGIN,
    } as any)

    // the ipc-handler will dispatch the right UPDATE event (or SET, if there was an error)
    ipcRenderer.send('settingsScrMerge', settings)
  }
}