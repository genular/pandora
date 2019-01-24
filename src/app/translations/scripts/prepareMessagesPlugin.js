/*
 * @Author: LogIN-
 * @Date:   2019-01-22 12:12:02
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-22 13:22:17
 */
const fs = require("fs");
const glob = require("glob");
const path = require("path");
// https://github.com/hughsk/flat
const flatten = require("flat");

/**
 * This path are relative to webpack script located: .webpack-config/webpack.base.config.js
 */
const filePattern = path.resolve(__dirname, "../") + "/source/**/*.json";
const outputDir = path.resolve(__dirname, "../");

function PrepareMessagesPlugin(options) {
	// JJ dev note: leaving this here in case we want to add options later
}

PrepareMessagesPlugin.prototype.apply = function(compiler) {
	compiler.plugin("done", function(stats) {
		// Aggregates the default messages that were extracted from the React components
		// via the React Intl Babel plugin. An error will be thrown if there
		// are messages in different components that use the same `id`. The result
		// is a flat collection of `id: message` pairs.
		const defaultMessages = glob
			.sync(filePattern)
			.map(filename => fs.readFileSync(filename, "utf8"))
			.map(file => JSON.parse(file))
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
							stats.compilation.errors.push(
								new Error(`ERROR compiling translation messages: Duplicate message id: ${id}`)
							);
						}
						collection[transID] = defaultMessage;
					}
				}
				return collection;
			}, {});

		if (!stats.compilation.errors.length) {
			const translationsPath = outputDir + "/all-messages.json";
			// console.log("Writing translation files: " + translationsPath);
			// Write the messages to /translations/all-messages.json
			fs.writeFileSync(translationsPath, JSON.stringify(defaultMessages, null, 2));
		}
	});
};

module.exports = PrepareMessagesPlugin;
