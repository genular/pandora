/*
 * @Author: LogIN-
 * @Date:   2019-01-22 12:12:02
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-02-11 14:24:47
 */
const fs = require("fs");
const glob = require("glob");
const path = require("path");
// https://github.com/hughsk/flat
const flatten = require("flat");

/**
 * This path are relative to webpack script located: .webpack-config/webpack.base.config.js
 */
const filePatternSource = path.resolve(__dirname, "../") + "/files/source/**/*.json";
const filePatternDest = path.resolve(__dirname, "../") + "/files/translated/**/*.json";
const filePattern = path.resolve(__dirname, "../") + "/files/source/**/*.json";
const outputDir = path.resolve(__dirname, "../files");

function PrepareMessagesPlugin(options) {
	// JJ dev note: leaving this here in case we want to add options later
}

PrepareMessagesPlugin.prototype.apply = function(compiler) {
	compiler.plugin("done", function(stats) {
		// The result is a flat collection of `id: message` pairs.
		const defaultMessages = glob
			.sync(filePatternSource)
			.map(function(filename) {
				return fs.readFileSync(filename, "utf8");
			})
			.map(function(file){
				return JSON.parse(file)
			})
			.reduce((collection, descriptors) => {
				/**
				 * Lets flatten the nested object in the following way
				 *   'login.username': 'Username'
				 */
				descriptors = flatten(descriptors);

				for (let transID in descriptors) {
					if (descriptors.hasOwnProperty(transID)) {
						let defaultMessage = descriptors[transID];
						if (collection.hasOwnProperty(transID)) {
							stats.compilation.errors.push(new Error(`Compiling translation messages: Duplicate message id: ${transID}`));
						}
						if (typeof defaultMessage === "string" || defaultMessage instanceof String) {
							collection[transID] = defaultMessage;
						} else {
							// console.log("Skipping untranslated key: " + transID);
						}
					}
				}
				return collection;
			}, {});

		const defaultLanguages = glob.sync(filePatternDest).map(filename =>
			filename
				.split(".")
				.slice(0, -1)
				.join(".")
				.split("\\")
				.pop()
				.split("/")
				.pop()
		);

		if (!stats.compilation.errors.length) {
			fs.writeFileSync(outputDir + "/translations.json", JSON.stringify(defaultMessages, null, 2));
		}
		fs.writeFileSync(outputDir + "/langs.json", JSON.stringify(defaultLanguages, null, 2));
	});
};

module.exports = PrepareMessagesPlugin;
