# Localization

## Implementation


## Extract new/edited English strings for translation
These are compiled automatically into JSON message files by custom webpack plugin `src/app/translations/scripts/prepareMessagesPlugin.js`.
The auto-generated file `all-messges.json` is parsed by `Crowdin` each time it is pushed to a branch and new/edited messages are queued for translation.
This is configured via `Crowdin` (github integration)[https://support.crowdin.com/github-integration/]


## Updating translations in the frontend
Crowdin automatically creates a PR to this repo each time a translator finishes some translation work. 
To utilize this translated text in the frontend, simply merge the PR from Crowdin and run `npm run translations`, then commit the resulting file called `translated-messges.json`.


## Adding/Editing strings in schemas