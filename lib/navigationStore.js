// simple module-level store for cross-component navigation state
let _backOverride = null

export const setBackOverride = (fn) => { _backOverride = fn }
export const getBackOverride = () => _backOverride
export const clearBackOverride = () => { _backOverride = null }