/*
 * @Author: LogIN-
 * @Date:   2019-01-22 11:54:49
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-02-11 07:32:57
 */
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const supportedLocales = require(path.resolve(__dirname, "../supported-locales.json"));
const defaultMessages = require(path.resolve(__dirname, "../all-messages.json"));
const translatedMessages = {};
const unsupportedLocales = [];

const filePattern = path.resolve(__dirname, "../") + "/languages/**/*.json";
const outputDir = path.resolve(__dirname, "../compiled");

glob.sync(filePattern).map(filePath => {
	const file = fs.readFileSync(filePath, "utf8");
	const contents = JSON.parse(file);
	const locale = filePath.substring(filePath.indexOf("/languages/") + 11, filePath.lastIndexOf("/"));

	if (locale && contents) {
		if (supportedLocales.includes(locale)) {
			translatedMessages[locale] = contents;
			console.info(`${locale}`);
		} else {
			unsupportedLocales.push(locale);
		}
	} else {
		console.info(`Error processing translations for ${locale}`);
	}
});

translatedMessages["en-US"] = defaultMessages;

if (unsupportedLocales.length) {
	console.info(`\nNOTE: translations not processed for these unsupported locales:`);
	unsupportedLocales.map(locale => console.info(`${locale} is not supported`));
}

for (let key in translatedMessages) {
	if (translatedMessages.hasOwnProperty(key)) {
		const locale = key;
		const translation = translatedMessages[key];
		const translationsPath = outputDir + "/" + locale + ".json";

		fs.writeFileSync(translationsPath, JSON.stringify(translation, null, 2));
		console.info("\nUpdated: " + translationsPath + "\n");
	}
}
