/**
 * Synchronous Check if File Path exist
 *
 * @returns {boolean}
 */
export function existsSync(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Synchronous Delete file or directory
 *
 * @returns {boolean}
 */
export function unlinkSync(filePath) {
    return fs.unlinkSync(filePath);
}

/**
 * Synchronous Delete directory recursively
 *
 * @returns {null}
 */
export function deleteFolderRecursive(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

/**
 * Synchronous file open
 *
 * @returns {integer}
 */
export function openSync(filePath, flags, mode) {
    return fs.openSync(filePath, flags, mode);
}

/**
 * Synchronously creates a directory.
 *
 * @returns {undefined}
 */
export function mkdirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

/**
 * Copy file from source to destination
 *
 */
export function copyFile(source, target) {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    return new Promise(function(resolve, reject) {
        rd.on("error", reject);
        wr.on("error", reject);
        wr.on("finish", resolve);
        rd.pipe(wr);
    }).catch(function(error) {
        rd.destroy();
        wr.end();
        throw error;
    });
}

/**
 *  Returns file extension
 *
 * @returns {string}
 */
export function getFileExtension(filename) {
    var ext = path.extname(filename || "").split(".");
    return ext[ext.length - 1];
}

/**
 * Synchronous writes data to a file.
 *
 */
export function saveDataString(filename, content) {
    fs.writeFileSync(filename, content);
}

/**
 *
 *
 */
export function loadDataString(filename) {
    let data = false;
    if (fs.existsSync(filename)) {
        data = fs.readFileSync(filename);
    }
    return data;
}

/**
 *
 *
 * @returns {array}
 */
export function readFilesInDirectory(directoryPath) {
    let dirFiles = [];
    return new Promise(function(resolve, reject) {
        fs.readdir(directoryPath, (err, files) => {
            "use strict";
            if (err) throw err;

            if (files[0] !== undefined) {
                for (const file of files) {
                    let fileType = "file";
                    const fullPath = path.join(directoryPath, file);
                    const stats = fs.statSync(fullPath);

                    if (stats.isDirectory()) {
                        fileType = "dir";
                    }
                    dirFiles.push({
                        type: fileType,
                        basename: file,
                        size: stats.size,
                        fullpath: fullPath,
                        selected: false,
                        ext: getFileExtension(file)
                    });
                }
                resolve(dirFiles);
            } else {
                reject(dirFiles);
            }
        });
    });
}
