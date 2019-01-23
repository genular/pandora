'use strict'
const path = require('path')
const _ = (module.exports = {})

_.cwd = file => {
  return path.join(process.cwd(), file || '')
}
