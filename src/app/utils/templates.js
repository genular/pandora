/*
 * @Author: LogIN-
 * @Date:   2019-01-23 15:04:44
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-25 15:36:41
 */

/**
 * [downloadItemsTemplate description]
 * @param  {array} items Array containing URLS to download files
 * @return {string}
 */
export function downloadItemsTemplate(items) {
	let template = "";
	let counter = 1;

	items.forEach(function(itemLink) {
		template += '<a class="download_item" href="'+itemLink+'" target="_blank">Download '+counter+'</a>';
		counter++;
	});
	return template;
}
/**
 * HTML Template used in download file window
 * @return {string} HTML Template string
 */
export function downloadFileTemplate() {
	const htmlTemplate = `
	<html>
	    <head>
	        <meta charset="utf-8">
	        <title>Downloading..</title>
	        <style>
	        * {
	            margin: 0px;
	            padding: 0px;
	        }
	        body {
	            color: #fff;
	            background-color: #35224A;
	        }
	        a {
	            color: #FFF;
	        }
	        #genular_logo {
	            background-image: url("https://raw.githubusercontent.com/genular/simon-frontend/master/src/app/assets/logo/png/white_logo_transparent%402x.png");
	            background-repeat: no-repeat;
	            display: block;
	            width: 250px;
	            height: 250px;
	            margin: 0 auto;
	            margin-top: 25px;
	            position: relative;
	            background-size: contain;
	        }
	        #download_text {
	            color: #fff;
	            text-align: center;
	            padding-top: 25px;
	        }
	        #footer {
	            position: absolute;
	            right: 0;
	            bottom: 0;
	            padding: 15px;
	        }
	        #download_links {
	            margin: 0 auto;
	            margin-top: 25px;
	            text-align: center;
	            display: block;
	        }
	        .download_item {
	        	padding-left: 10px;
	        	color: #FFFFFF;
	        }
	        .loader {
	            border: 5px solid #f3f3f3;
	            border-top-color: rgb(243, 243, 243);
	            border-top-style: solid;
	            border-top-width: 5px;
	            border-top: 5px solid #3498db;
	            border-radius: 50%;
	            width: 25px;
	            height: 25px;
	            animation: spin 2s linear infinite;
	            margin: 0 auto;
	        }
	        @keyframes spin {
	            0% {
	                transform: rotate(0deg);
	            }

	            100% {
	                transform: rotate(360deg);
	            }
	        }
	        </style>
	    </head>
	    <body>
	        <div id="genular_logo"></div>
	        <div id="download_text">Generating download link, please wait links to appear...</div>
	        <div id="download_links">
	            <div class="loader"></div>
	        </div>
	        <div id="footer">made with ❤️ by
	            <a href="https://genular.org" target="_blank">genular</a>
	        </div>
	    </body>
	</html>
	`;

	return htmlTemplate;
}
