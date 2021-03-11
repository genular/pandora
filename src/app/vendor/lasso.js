/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} LassoOptions
 * @property {HTMLImageElement} element
 * @property {number} radius
 * @property {(polygon: string) => void} onChange
 * @property {(polygon: string) => void} onUpdate
 * @property {boolean} enabled
 */

const md5 = require("@/utils/3rdparty/md5.js");

/**
 * Create Canvas Config
 * @param {LassoOptions} options
 */
export function createLasso(options) {
    if (!(options.element instanceof HTMLImageElement)) {
        throw new Error("options.element is not a HTMLImageElement instance");
    }
    if (!options.element.parentElement) {
        throw new Error("options.element have no parentElement");
    }
    options = Object.assign(
        {
            radius: 5,
            onChange: Function.prototype,
            onUpdate: Function.prototype,
            onComplete: Function.prototype,
            enabled: true,
        },
        options
    );

    // Replace elements
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    /**
     * @type {Point[]}
     */
    const path = [];
    let previous_path_hash = null;
    let domRect = null;
    let pathClosed = false;
    const lastEvents = {
        start: 0,
        move: 0,
        end: 0,
    };

    /**
     * @param {() => void} fn
     */
    const addCtxPath = (fn) => {
        ctx.save();
        ctx.beginPath();
        fn();
        ctx.closePath();
        ctx.restore();
    };
    /**
     * @param {number} x
     * @param {number} y
     */
    const drawPoint = (x, y) => {
        addCtxPath(() => {
            ctx.arc(x, y, options.radius, 0, 2 * Math.PI);
            ctx.stroke();
        });

        addCtxPath(() => {
            ctx.moveTo(x - options.radius / 2, y - options.radius / 2);
            ctx.lineTo(x + options.radius / 2, y + options.radius / 2);
            ctx.stroke();
        });

        addCtxPath(() => {
            ctx.moveTo(x + options.radius / 2, y - options.radius / 2);
            ctx.lineTo(x - options.radius / 2, y + options.radius / 2);
            ctx.stroke();
        });
    };
    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    const drawLine = (p1, p2) => {
        addCtxPath(() => {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
    };
    const nextFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(options.element, 0, 0, canvas.width, canvas.height);
        for (let i = 0; i < path.length; i++) {
            const { x, y } = path[i];
            drawPoint(x, y);
            if (i > 0) {
                drawLine(path[i - 1], path[i]);
            }
        }
        if (pathClosed) {
            if (path.length > 1) {
                console.log("==========");
                console.log(path);
                if (path.length > 0) {
                    if (typeof path[0] !== "undefined") {
                        drawLine(path[0], path[path.length - 1]);
                        addCtxPath(() => {
                            ctx.moveTo(path[0].x, path[0].y);
                            for (let i = 1; i < path.length; i++) {
                                const { x, y } = path[i];
                                ctx.lineTo(x, y);
                            }
                            ctx.fillStyle = "rgba(134, 228, 35, 0.45)";
                            ctx.fill();
                        });
                    }
                }
            }
        } else if (path.length && !controllers.selectedPoint) {
            const { x, y } = getDistance(path[0], controllers.pos) <= options.radius ? path[0] : controllers.pos;
            drawPoint(x, y);
            drawLine(path[path.length - 1], {
                x,
                y,
            });
        }

        if (pathClosed && path.length && !controllers.selectedPoint) {
            onPathComplete();
        }
    };
    if (options.element.complete && options.element.naturalHeight !== 0) {
        onLoad();
    } else {
        options.element.addEventListener("load", () => onLoad());
    }

    /**
     * @param {MouseEvent | TouchEvent} e
     * @param {boolean} [shiftSensitive]
     */
    const getMousePosition = (e, shiftSensitive = true) => {
        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            const tEvent = e.touches[0];
            clientX = tEvent.clientX;
            clientY = tEvent.clientY;
        }
        const rect = canvas.getBoundingClientRect();
        const ret = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
        if (e.shiftKey) {
            if (!controllers.relativePoint && path.length) {
                controllers.relativePoint = path.filter((p) => p !== controllers.selectedPoint).reduce((a, b) => (getDistance(ret, a) < getDistance(ret, b) ? a : b));
            }
        } else {
            controllers.relativePoint = null;
        }
        if (shiftSensitive && controllers.relativePoint) {
            straightenLine(ret, controllers.relativePoint);
        }
        return ret;
    };

    const controllers = {
        mousedown: false,
        startPos: {
            x: 0,
            y: 0,
        },
        pos: {
            x: 0,
            y: 0,
        },
        selectedPoint: null,
        relativePoint: null,
    };
    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
    ["mousedown", "touchstart"].forEach((event) =>
        canvas.addEventListener(
            event,
            /** @param {MouseEvent | TouchEvent} e */ (e) => {
                if (!options.enabled || Date.now() - lastEvents.start < 10) {
                    return;
                }
                lastEvents.start = Date.now();
                nextFrame();
                controllers.mousedown = true;
                controllers.startPos = getMousePosition(e, false);
                controllers.pos = getMousePosition(e);

                controllers.selectedPoint = path.find((p1) => getDistance(p1, controllers.pos) <= options.radius) || null;
            }
        )
    );
    ["mousemove", "touchmove"].forEach((event) =>
        canvas.addEventListener(
            event,
            /** @param {MouseEvent | TouchEvent} e */ (e) => {
                if (!options.enabled || Date.now() - lastEvents.move < 10) {
                    return;
                }
                lastEvents.move = Date.now();
                controllers.pos = getMousePosition(e);
                if (controllers.mousedown) {
                    if (controllers.selectedPoint) {
                        controllers.selectedPoint.x = controllers.pos.x;
                        controllers.selectedPoint.y = controllers.pos.y;
                        onPathUpdate();
                    }
                }
                nextFrame();
            }
        )
    );
    ["mouseup", "touchend", "touchcancel"].forEach((event) =>
        canvas.addEventListener(
            event,
            /** @param {MouseEvent | TouchEvent} e */ (e) => {
                if (!options.enabled || Date.now() - lastEvents.end < 10) {
                    return;
                }
                lastEvents.end = Date.now();
                if (e instanceof MouseEvent && e.button === 2) {
                    if (controllers.selectedPoint) {
                        path.splice(path.indexOf(controllers.selectedPoint), 1);
                    } else {
                        const pointToRemove = path.find((p1) => getDistance(p1, controllers.pos) <= options.radius);
                        if (pointToRemove) {
                            path.splice(path.indexOf(pointToRemove), 1);
                        }
                    }
                } else {
                    if (!controllers.selectedPoint) {
                        path.push({
                            x: controllers.pos.x,
                            y: controllers.pos.y,
                        });
                    } else if (controllers.selectedPoint === path[0]) {
                        pathClosed = true;
                    }
                }
                if (path.length < 3) {
                    pathClosed = false;
                }
                controllers.mousedown = false;
                controllers.selectedPoint = null;
                controllers.relativePoint = null;
                onPathChange();
                onPathUpdate();
                nextFrame();
            }
        )
    );

    function onLoad() {
        console.log(options.element.width);
        console.log(options.element.naturalWidth);

        domRect = options.element.getBoundingClientRect();

        canvas.width = domRect.width;
        canvas.height = domRect.height;
        options.element.parentElement.replaceChild(canvas, options.element);
        nextFrame();
    }
    /**
     * @param {Point} point
     * @param {Point} [relative]
     */
    function straightenLine(point, relative) {
        const dx = Math.abs(relative.x - point.x);
        const dy = Math.abs(relative.y - point.y);
        if (dx > dy) {
            point.y = relative.y;
        } else {
            point.x = relative.x;
        }
    }
    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    function getDistance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    function pathToString() {
        return path.map(({ x, y }) => x + "," + y).join(" ");
    }

    function onPathChange() {
        const polygon = pathToString();
        options.onChange(polygon);
    }

    function onPathUpdate() {
        const polygon = pathToString();
        options.onUpdate(polygon);
    }

    function onPathComplete() {
        const ret_details = {
            display: {
                width: domRect.width,
                height: domRect.height,
            },
            cord: path,
        };

        const path_hash = md5(JSON.stringify(ret_details));
        if (path_hash !== previous_path_hash) {
            options.onComplete(ret_details);
            previous_path_hash = path_hash;
        }
    }
    return {
        reset() {
            path.length = 0;
            pathClosed = false;
            nextFrame();
            onPathChange();
            onPathUpdate();
            onPathComplete();
        },
        /**
         * @param {string} polygon
         */
        setPath(polygon) {
            const newPath = polygon.split(" ").map((s) => {
                const [x, y] = s.split(",");
                return {
                    x: parseInt(x, 10),
                    y: parseInt(y, 10),
                };
            });
            path.length = 0;
            path.push(...newPath);
            pathClosed = true;
            nextFrame();
            onPathChange();
            onPathUpdate();
        },
        enable() {
            options.enabled = true;
            nextFrame();
        },
        disable() {
            if (!pathClosed) {
                path.length = 0;
                pathClosed = true;
                onPathChange();
                onPathUpdate();
                nextFrame();
            }
            options.enabled = false;
        },
        destroy() {
            console.log("Canvas destroy");

            if (!pathClosed) {
                path.length = 0;
                pathClosed = true;
                onPathChange();
                onPathUpdate();
                nextFrame();
            }
            options.enabled = false;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //canvas.remove();
        },
    };
}
