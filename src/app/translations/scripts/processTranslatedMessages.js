/*
* @Author: LogIN-
* @Date:   2019-01-22 11:54:49
* @Last Modified by:   LogIN-
* @Last Modified time: 2019-01-22 13:25:01
*/
const fs = require('fs')
const glob = require('glob')
const path = require("path");
const supportedLocales = require('../supported-locales.json')
const defaultMessages = require('../all-messages.json')
const translatedMessages = {}
const unsupportedLocales = []

const filePattern = path.resolve(__dirname, "../") + "/languages/**/*.json";

glob.sync(filePattern)
  .map((filePath) => {

    const file = fs.readFileSync(filePath, 'utf8')
    const contents = JSON.parse(file)
    const locale = filePath.substring( filePath.indexOf('/languages/') + 11, filePath.lastIndexOf('/') )

    if (locale && contents) {

      if (supportedLocales.includes(locale)) {
        translatedMessages[locale] = contents
        console.info(`✅  ${locale}`)
      } else {
        unsupportedLocales.push(locale)
      }

    } else {
      console.info(`❌  Error processing translations for ${locale}`)
    }
    
  })

translatedMessages['en-US'] = defaultMessages

if (unsupportedLocales.length) {
  console.info(`\nNOTE: translations not processed for these unsupported locales:`)
  unsupportedLocales.map((locale) => console.info(`❌  ${locale} is not supported`))
}

fs.writeFileSync('./translations/translated-messages.json', JSON.stringify(translatedMessages, null, 2))

console.info('\n✅  Updated: /translations/translated-messages.json\n')
