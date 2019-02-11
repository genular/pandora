# Localization
Here you can find how localization workflow works in this project

## Helping out
[Join our Translation Community](https://crowdin.com/project/genular)

## Add new strings in the templates
Translations are compiled automatically into JSON file `src/app/translations/files/translations.json` by custom webpack plugin `src/app/translations/scripts/prepareMessagesPlugin.js`.
For example when you run `yarn run webpack:web:dev`

The auto-generated file `src/app/translations/files/translations.json` is parsed by `Crowdin` each time it is pushed to a branch and new/edited messages are queued for translation.
This is github plug-in configured via `Crowdin` (github integration)[https://support.crowdin.com/github-integration/]

1. Add translation in ./source
2. Add corresponding to the the vue templates
3. Build  `translations.json` with webpack. `yarn run webpack:web:dev`
4. Push code to github
5. Wait for crowdin PR request and merge crowdin translations branch `crowdin` into repo
6. pull newly added crowdin translations

## Updating translations in the frontend
Crowdin automatically creates a PR to this repo each time a translator finishes some translation work. Sync schedule is 10 minutes.
To utilize this translated text in the frontend, simply merge the PR from Crowdin