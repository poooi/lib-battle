
export PacketManager from './packet'
export Simulator from './simulator'

import * as _MP from './packet'
import * as _MS from './simulator'
export const Models = {..._MP, ..._MS}
