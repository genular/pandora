# Localization
Here you can find how localization work-flow works in this project

## Implementation
Locales defined in `src/app/translations/supported-locales.json` must match ones defined in `Crowdin`

When adding new language add it to source translation file `src/app/translations/source/components/LangSelect/index.json` 
under `components.LangSelect.language` key.
Also as mentioned this locale must be defined in `supported-locales.json`

## Extract new/edited strings for translation
These are compiled automatically into JSON message file `all-messages.json` by custom webpack plugin `src/app/translations/scripts/prepareMessagesPlugin.js`.

The auto-generated file `all-messges.json` is parsed by `Crowdin` each time it is pushed to a branch and new/edited messages are queued for translation.
This is github plug-in configured via `Crowdin` (github integration)[https://support.crowdin.com/github-integration/]

1. Add translation in ./source
2. Add them in the templates
3. Build  `all-messages.json` with webpack. `yarn run webpack:web:dev`
4. Push code to github
5. Wait for crowdin PR request and merge crowdin translations branch `crowdin` into repo
6. pull newly added crowdin translations
7. Compile them new translated files into `translated-messages.json`: `yarn run translations`

## Updating translations in the frontend
Crowdin automatically creates a PR to this repo each time a translator finishes some translation work. Sync schedule is 10 minutes.

To utilize this translated text in the frontend, simply merge the PR from Crowdin and run `yarn run translations`, then commit the resulting file called `translated-messges.json` that is finally used on frontend.