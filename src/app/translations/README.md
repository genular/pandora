# Localization
Here you can find how localization workflow works in SIMON

## Helping out
[Join our Translation Community](https://crowdin.com/project/genular) and help us correct existing translations, or add new ones.

### New language request!?
Pleas open new GitHub issue [Here](https://github.com/genular/simon-frontend/issues)

## Working with translation files in source code
### Add new strings in the templates
Translations are compiled automatically into JSON file `src/app/translations/files/translations.json` 
by custom webpack plugin `src/app/translations/scripts/prepareMessagesPlugin.js`.
For example when you run `yarn run webpack:web:dev`

The auto-generated file `src/app/translations/files/translations.json` is than parsed 
by `Crowdin` each time it is pushed to a branch and new/edited messages are queued for translation.

This is github plug-in configured via `Crowdin` (github integration)[https://support.crowdin.com/github-integration/]

- Add translation in ./source
- Add corresponding to the the vue templates
- Build  `translations.json` with webpack. `yarn run webpack:web:dev`
- Push code to github
- Wait for crowdin PR request and merge crowdin translations branch `crowdin` into repo
- pull newly added crowdin translations. 
- In case completely new locale/language translation was added run  `yarn run webpack:web:dev` so `src/app/translations/files/langs.json` is regenerated so it can be include it here: `src/app/translations/files/source/components/LangSelect/index.json`

### Updating translations in the frontend
Crowdin automatically creates a PR to this repo each time a translator finishes some translation work. Sync schedule is 10 minutes.
To utilize this translated text in the frontend, simply merge the PR from Crowdin