"use strict";
const path = require("path");
const fs = require("fs");
const _ = (module.exports = {});

_.cwd = file => {
	return path.join(process.cwd(), file || "");
};

/**
 * Copy CMD arguments to environment file
 * @param  {string} environment - Environment to configure
 * @param  {object} argv - Command-line arguments
 * @return {string} Path to the final environment configuration file
 */

_.configureEnvironment = (environment, argv) => {
	// Copy configuration template and try to set initial env variables
	const envTemplateExample = path.resolve(__dirname, `../config/env_${environment}.example.json`);
	const envTemplateFinal = path.join(__dirname, `../config/env_${environment}.json`);

	if (argv) {
		let envTemplate = require(envTemplateExample);

		// Helper function to get value from argv or environment variables
		const getValue = (key, envKey, defaultValue) => {
			if (typeof argv[key] !== "undefined") {
				console.log(`Using ${key} from argv: ${argv[key]}`);
				return argv[key];
			} else if (typeof process.env[envKey] !== "undefined") {
				console.log(`Using ${key} from environment variable ${envKey}: ${process.env[envKey]}`);
				return process.env[envKey];
			} else {
				console.log(`Using default value for ${key}: ${defaultValue}`);
				return defaultValue;
			}
		};

		// Update configuration with command-line arguments or environment variables
		envTemplate.isDemoServer = getValue("isDemoServer", "IS_DEMO_SERVER", envTemplate.isDemoServer) === 'true';
		envTemplate.server.frontend = getValue("server_frontend", "SERVER_FRONTEND_URL", envTemplate.server.frontend);
		envTemplate.server.backend = getValue("server_backend", "SERVER_BACKEND_URL", envTemplate.server.backend);
		envTemplate.server.homepage = getValue("server_homepage", "SERVER_HOMEPAGE_URL", envTemplate.server.homepage);

		fs.writeFileSync(envTemplateFinal, JSON.stringify(envTemplate, null, 2));
	}

	return envTemplateFinal;
};
