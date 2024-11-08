"use strict";
const path = require("path");
const fs = require("fs");
const _ = (module.exports = {});

_.cwd = file => {
	return path.join(process.cwd(), file || "");
};

/**
 * Copy CMD arguments to environment file
 * @param  {[type]} environment [description]
 * @return {[type]}            [description]
 */
_.configureEnvironment = (environment, argv) => {
	// Copy configuration template and try to set initial env variables
	const envTemplateExample = path.resolve(__dirname, `../config/env_${environment}.example.json`);
	const envTemplateFinal = path.join(__dirname, `../config/env_${environment}.json`);

	// If destination file doesn't exist, copy data from template
	if (argv) {
		let envTemplate = require(envTemplateExample);
		let updatedVars = 0;

		// Function to get value from argv or process.env
		const getValue = (key, defaultValue) => {
			let value;
			if (typeof process.env[key] !== "undefined") {
				value = process.env[key];
				console.log(`Using ${key} from environment variable: ${value}`);
			}else if (typeof argv[key] !== "undefined" && argv[key].length > 1) {
				value = argv[key];
				console.log(`Using ${key} from argv: ${value}`);
			} else {
				value = defaultValue;
				console.log(`Using default value for ${key}: ${value}`);
			}
			return value;
		};


		// Update variables from argv or environment variables
		envTemplate.isDemoServer = getValue("isDemoServer", envTemplate.isDemoServer) === 'true';
		if (envTemplate.isDemoServer) updatedVars++;
		
		envTemplate.server.frontend = getValue("SERVER_FRONTEND_URL", envTemplate.server.frontend);
		if (envTemplate.server.frontend) updatedVars++;

		envTemplate.server.backend = getValue("SERVER_BACKEND_URL", envTemplate.server.backend);
		if (envTemplate.server.backend) updatedVars++;

		envTemplate.server.homepage = getValue("SERVER_HOMEPAGE_URL", envTemplate.server.homepage);
		if (envTemplate.server.homepage) updatedVars++;

		// If any variables were updated, write to the final file
		if (updatedVars > 0) {
			const updatedEnvTemplate = JSON.stringify(envTemplate, null, 2);
			fs.writeFileSync(envTemplateFinal, updatedEnvTemplate);
		}
	}
	return envTemplateFinal;
};
