/*
 * @Author: LogIN-
 * @Date:   2019-01-23 15:04:44
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-25 09:37:39
 */

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
		            a{
		            color: #FFF;
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
		        </style>
		    </head>
		    <div id="download_text">Generating download link, please wait...</div>
		    <div id="footer">made with ❤️ by <a href="https://genular.org">genular</a></div>
		    <body>
		</html>
	`;

	return htmlTemplate;
}
