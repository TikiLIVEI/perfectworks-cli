import {Hook} from '@oclif/core'

import {BannerService} from '../services/banner.js'

const hook: Hook<'prerun'> = async function (opts) {
  // Show banner before running any command except help
  // This prevents showing the banner for help commands which would be redundant
  if (opts.Command?.id && !opts.Command.id.includes('help')) {
    BannerService.show()
  }
}

export default hook
