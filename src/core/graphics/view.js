/// <reference path='../collection.ts' />
/// <reference path='../math.ts' />
/// <reference path='style.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'lodash', '../collection', './style', '../math', '../dataprovider'], function (require, exports, _, collection, style, math, data) {
    var identify = collection.identify;
    var Vector = math.Vector;
    // Canvas view that supports state transitions while drawing a model of type M.
    var View = (function () {
        // Base constructor, by HTML element id.
        function View(htmlId) {
            var _this = this;
            this.htmlId = htmlId;
            // Adjust canvas scaling and dimensions for high-DPI screens.
            this.pixelRatio = 1;
            this.storeRatio = 1;
            this.htmlId = htmlId;
            var document = window.document;
            this.content = document.getElementById(this.htmlId);
            this.canvas = document.createElement("canvas");
            this.content.appendChild(this.canvas);
            this.manager = new DrawManager();
            this.mousePos = [0, 0];
            this.hits = [];
            // Push property events to subjects.
            this.resizeBus = new Bacon.Bus();
            this.resize = this.resizeBus.skipDuplicates(_.isEqual);
            window.addEventListener("resize", function () { return _this.resizeBus.push(new ViewResizeEvent(_this.dimensions())); });
            this.resize.onValue(function (dim) { return console.log("Resize dimensions: " + dim); });
            // Update mouse hits.
            Bacon.fromEventTarget(this.canvas, 'mousemove').onValue(function (e) {
                _this.mousePos = _this.correctHighDPIMouse([e.offsetX, e.offsetY]);
                _this.update();
            });
            // Push mouse events to subjects.
            document.oncontextmenu = function () { return false; }; // Circumvent mouse context menu.
            this.mouseClick = Bacon.fromEventTarget(this.canvas, 'click').map(function (e) { return new ViewMouseEvent(e, 'mouseClick', _this.mousePos, _this.hits); });
            this.mouseDown = Bacon.fromEventTarget(this.canvas, 'mousedown').map(function (e) { return new ViewMouseEvent(e, 'mouseDown', _this.mousePos, _this.hits); });
            this.mouseUp = Bacon.fromEventTarget(this.canvas, 'mouseup').map(function (e) { return new ViewMouseEvent(e, 'mouseUp', _this.mousePos, _this.hits); });
            this.mouseDrag = Bacon.fromEventTarget(this.canvas, 'mousemove').filter(function (e) { return _this.detectLeftButton(e); }).map(function (e) { return new ViewMouseEvent(e, 'mouseDrag', _this.mousePos, _this.hits); });
            this.mouseMove = Bacon.fromEventTarget(this.canvas, 'mousemove').filter(function (e) { return !_this.detectLeftButton(e); }).map(function (e) { return new ViewMouseEvent(e, 'mouseMove', _this.mousePos, _this.hits); });
            $(document).on("keydown", function (e) {
                if (e.which === 8 && !$(e.target).is("input:not([readonly]), textarea")) {
                    e.preventDefault();
                }
            });
            this.keyPress = Bacon.fromEventTarget(document, 'keydown').map(function (e) { return new ViewKeyEvent(e); });
            // Generic view events.
            this.event = Bacon.mergeAll([
                this.resize,
                this.mouseClick,
                this.mouseDown,
                this.mouseUp,
                this.mouseDrag,
                this.mouseMove,
                this.keyPress
            ]);
        }
        View.prototype.update = function (model) {
            var _this = this;
            if (model === void 0) { model = null; }
            if (model) {
                this.model = model;
                this.updateScene(model);
            }
            this.updateTime = new Date().getTime();
            if (!this.updater && model)
                this.updater = window.setInterval(function () { return _this.updateCycle(); }, 30);
        };
        // To be implemented in subclass.
        View.prototype.updateScene = function (model) {
        };
        View.prototype.updateCycle = function () {
            var man = this.manager;
            //this.canvas.width = this.content.offsetWidth;
            //this.canvas.height = this.content.offsetHeight;
            var context = this.canvas.getContext('2d');
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.textBaseline = "bottom";
            // Adjust canvas scaling and dimensions for high-DPI screens.
            this.correctHighDPI(context);
            //this.resizeBus.push(new ViewResizeEvent(this.dimensions()));
            // Pre draw.
            var nT = new Date().getTime(); // Determine the time passed since last draw.
            man.dT = Math.min(100, man.oT ? (nT - man.oT) : 100);
            man.oT = nT;
            man.snippetList.forEach(function (sV) {
                sV.drawn = false;
                sV.ti = 0;
            });
            var viewContext = new ViewContext(context, man, this.dimensions(), this.mousePos);
            viewContext.transitioning = false; // No parameter interpolation outside of snippets.
            viewContext.picking = false;
            // Subclass paint.
            this.paint(viewContext, this.model);
            // Post draw.
            // Fade away and/or remove redundant snippets.
            var toRemove = [];
            man.snippetList.forEach(function (sV) {
                // Fade in.
                if (sV.drawn) {
                    sV.presence = sV.transitioning ? Math.min(1, sV.presence + man.dT / DrawManager.pD) : 1;
                }
                else {
                    // Remove.
                    if (sV.presence < 0.1) {
                        toRemove.push(sV);
                    }
                    else {
                        sV.presence = sV.transitioning ? sV.presence - man.dT / DrawManager.pD : 0;
                    }
                }
            });
            toRemove.forEach(function (sV) {
                //delete man.snippets[sV.id];
                man.snippets[sV.id] = null;
                var endSnip = man.snippetList.pop();
                if (endSnip.id !== sV.id) {
                    man.snippetList[sV.index] = endSnip;
                    endSnip.index = sV.index;
                }
            });
            // Update snippets.
            //var newSnippets: StringMap<SnippetValues> = {};
            // Draw non-drawn snippets.
            man.snippetList.forEach(function (sV) {
                if (!sV.drawn) {
                    // Apply last known transformation and style.
                    var t = sV.transform;
                    context.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
                    // Draw snippet, push to back.
                    if (sV.args) {
                        sV.args.forEach(function (as) { return viewContext.snippet.apply(viewContext, _.union([sV.instance], as)); });
                    }
                    else
                        viewContext.snippet(sV.instance);
                }
            });
            // Update mouse hits and cursor.
            this.hits = viewContext.hits;
            this.canvas.style.cursor = this.hits.length > 0 ? "pointer" : "default";
            // Terminate updates.
            if (nT > this.updateTime + 10 * (DrawManager.mD + DrawManager.pD)) {
                window.clearInterval(this.updater);
                this.updater = null;
            }
            /*if(nT - this.updateTime > 10 * DrawManager.pD) {
                this.updater = false;
            } else {
                window["requestAnimFrame"](() => this.updateCycle());
                //console.log("Update anim frame.");
            }*/
        };
        View.prototype.correctHighDPI = function (context) {
            this.pixelRatio = window.devicePixelRatio || 1; // Device pixel ratio, fallback to 1.
            this.storeRatio = context['webkitBackingStorePixelRatio'] || context['mozBackingStorePixelRatio'] || context['msBackingStorePixelRatio'] || context['oBackingStorePixelRatio'] || context['backingStorePixelRatio'] || 1;
            var scaleRatio = this.pixelRatio / this.storeRatio; // Determine the actual ratio we want to draw at.
            // Scale up area of canvas.
            this.canvas.width = Math.ceil(this.content.offsetWidth * scaleRatio);
            this.canvas.height = Math.ceil(this.content.offsetHeight * scaleRatio);
            // Fix dimensions of the actual canvas via CSS.
            this.canvas.style.width = this.content.offsetWidth + 'px';
            this.canvas.style.height = this.content.offsetHeight + 'px';
            // Scale the drawing context so everything will work at the higher ratio.
            context.scale(scaleRatio, scaleRatio);
        };
        View.prototype.correctHighDPIMouse = function (pos) {
            return Vector.mul(pos, this.pixelRatio / this.storeRatio);
        };
        // Off-screen buffer draw helper function.
        View.renderToCanvas = function (width, height, renderFunction) {
            var buffer = document.createElement('canvas');
            var ctx = buffer.getContext('2d');
            var pixelRatio = window.devicePixelRatio || 1; // Device pixel ratio, fallback to 1.
            var storeRatio = ctx['webkitBackingStorePixelRatio'] || ctx['mozBackingStorePixelRatio'] || ctx['msBackingStorePixelRatio'] || ctx['oBackingStorePixelRatio'] || ctx['backingStorePixelRatio'] || 1;
            var scaleRatio = pixelRatio / storeRatio;
            buffer.width = Math.ceil(width * scaleRatio);
            buffer.height = Math.ceil(height * scaleRatio);
            buffer['originalWidth'] = width;
            buffer['originalHeight'] = height;
            ctx.scale(scaleRatio, scaleRatio);
            renderFunction(ctx);
            return buffer;
        };
        // Implemented by sub-class to paint.
        View.prototype.paint = function (context, scene) {
        };
        // Determine whether left button is pressed from mouse event.
        View.prototype.detectLeftButton = function (event) {
            var isPressed;
            if ('buttons' in event) {
                isPressed = event.buttons === 1;
            }
            else if ('which' in event) {
                isPressed = event.which === 1;
            }
            else {
                isPressed = event.button === 1;
            }
            return isPressed;
        };
        // Full canvas dimensions.
        View.prototype.dimensions = function () {
            return [this.content.offsetWidth, this.content.offsetHeight];
        };
        return View;
    })();
    exports.View = View;
    // Request animation frame fallback
    window["requestAnimFrame"] = window.requestAnimationFrame || (function (cb) { return window.setTimeout(cb, 1000 / 30); });
    var ViewEvent = (function () {
        function ViewEvent(event, type) {
            this.event = event;
            this.type = type;
        }
        ViewEvent.prototype.onMouse = function (action) {
        };
        ViewEvent.prototype.onResize = function (action) {
        };
        ViewEvent.prototype.onKey = function (action) {
        };
        return ViewEvent;
    })();
    exports.ViewEvent = ViewEvent;
    var ViewMouseEvent = (function (_super) {
        __extends(ViewMouseEvent, _super);
        function ViewMouseEvent(event, // Parent mouse event.
            type, position, // Absolute mouse position.
            hits // Hit snippets.
            ) {
            _super.call(this, event, type);
            this.event = event;
            this.type = type;
            this.position = position;
            this.hits = hits;
            this.topHit = this.hits.length > 0 ? this.hits[this.hits.length - 1] : null;
        }
        // Delegate.
        ViewMouseEvent.prototype.onMouse = function (action) {
            action(this, this.position, this.topHit ? this.topHit.snippet.toString() : null, this.hits);
        };
        return ViewMouseEvent;
    })(ViewEvent);
    exports.ViewMouseEvent = ViewMouseEvent;
    var MouseHit = (function () {
        function MouseHit(snippet, local, // Local mouse position.
            normalized // Normalized local mouse position.
            ) {
            this.snippet = snippet;
            this.local = local;
            this.normalized = normalized;
        }
        return MouseHit;
    })();
    var ViewResizeEvent = (function (_super) {
        __extends(ViewResizeEvent, _super);
        function ViewResizeEvent(dimensions) {
            _super.call(this, null, 'resize');
            this.dimensions = dimensions;
        }
        // Delegate.
        ViewResizeEvent.prototype.onResize = function (action) {
            action(this.dimensions);
        };
        return ViewResizeEvent;
    })(ViewEvent);
    exports.ViewResizeEvent = ViewResizeEvent;
    var ViewKeyEvent = (function (_super) {
        __extends(ViewKeyEvent, _super);
        function ViewKeyEvent(event) {
            _super.call(this, event, 'key');
            this.event = event;
        }
        // Delegate.
        ViewKeyEvent.prototype.onKey = function (action) {
            action(this.event);
        };
        return ViewKeyEvent;
    })(ViewEvent);
    exports.ViewKeyEvent = ViewKeyEvent;
    // Manages the interpolation for a view.
    var DrawManager = (function () {
        function DrawManager() {
            this.snippets = {}; // Mapping of snippets to managed values.
            this.snippetList = []; // Fast snippet lookup.
        }
        DrawManager.mD = 100; // Movement duration.
        DrawManager.pD = 100; // Presence duration.
        return DrawManager;
    })();
    // Additional information that is maintained for a snippet during its lifespan.
    var SnippetValues = (function () {
        function SnippetValues() {
            this.ti = 0; // Index counter of transitioned values for drawn snippet.
            this.drawn = false; // Whether snippet has been drawn (for fade-out).
            this.presence = -DrawManager.mD / DrawManager.pD; // Extent of presence in the scene, includes delay.
            this.intermediates = []; // Intermediate state of doubles that are transitioned over.
            this.transform = [0, 0, 0, 0, 0, 0]; // Last known transformation matrix.
            this.transitioning = true; // Last known transitioning value.
            this.args = []; // All instance call arguments.
        }
        return SnippetValues;
    })();
    var Intermediate = (function () {
        function Intermediate(value, change) {
            this.value = value;
            this.change = change;
        }
        return Intermediate;
    })();
    var ViewContext = (function () {
        function ViewContext(context, manager, dimensions, // Canvas dimensions.
            mouse // Absolute mouse position.
            ) {
            this.context = context;
            this.manager = manager;
            this.dimensions = dimensions;
            this.mouse = mouse;
            this.hits = [];
            this.updateMouse();
            this.dT = manager.dT;
            this.mD = DrawManager.mD;
            this.mD2 = this.mD * this.mD;
        }
        // Set interpolation checkpoint by identifier.
        ViewContext.prototype.snippet = function (snippet) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!snippet)
                return;
            var id = identify(snippet);
            var man = this.manager;
            // Set snippet values context.
            this.sV = man.snippets[id];
            if (!this.sV) {
                this.sV = new SnippetValues();
                man.snippets[id] = this.sV;
                this.sV.id = id;
                this.sV.index = man.snippetList.length;
                man.snippetList.push(this.sV);
            }
            if (!this.sV.drawn)
                this.sV.args = []; // Refresh argument list.
            this.sV.drawn = true; // Is drawn.
            this.sV.instance = snippet; // Update last drawn snippet.
            this.sV.transform = this.context['getTransform'](); // Initial transform of last draw.
            if (args.length)
                this.sV.args.push(_.clone(args)); // Push instance arguments.
            this.transitioning = true; // Parameter interpolation enabled by default.
            this.picking = false; // Picking disabled by default.
            if (args.length)
                snippet.paint.apply(snippet, _.flatten([this, args], true));
            else
                snippet.paint(this);
            this.sV.transitioning = this.transitioning; // Update last transitioning value.
        };
        ViewContext.prototype.snippets = function (snippets) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!snippets)
                return;
            if (args.length)
                snippets.forEach(function (s) { return _this.snippet.apply(_this, _.flatten([s, args], true)); });
            else
                snippets.forEach(function (s) { return _this.snippet(s); });
        };
        // Transition value to target, returns intermediate.
        ViewContext.prototype.t = function (target) {
            var sV = this.sV;
            if (sV) {
                if (this.transitioning) {
                    var im = sV.intermediates[sV.ti];
                    if (!im) {
                        im = new Intermediate(target, 0); // TODO: change to latest queued value?
                        sV.intermediates.push(im);
                    }
                    var d = target - im.value; // Apply acceleration.
                    im.change += this.dT * (d - (2 * im.change * this.mD)) / this.mD2;
                    var ad = this.dT * im.change; // Apply velocity.
                    //im.value += ad;
                    im.value = ad > 0 ? Math.min(target, im.value + ad) : Math.max(target, im.value + ad);
                    sV.ti++; // Increment for next transition.
                }
                else {
                    //im.value = target;
                    return target;
                }
            }
            else {
                return target;
            }
            return im.value;
        };
        // Interpolate color to CSS string.
        ViewContext.prototype.tColor = function (color) {
            return "rgba(" + Math.round(this.t(color.r)) + "," + Math.round(this.t(color.g)) + "," + Math.round(this.t(color.b)) + "," + (this.t(color.a) * (this.sV ? this.sV.presence : 0)).toFixed(2) + ")";
        };
        // Update mouse position in local space.
        ViewContext.prototype.updateMouse = function () {
            var t = this.context['getTransform']();
            var d = 1 / (t[0] * t[3] - t[1] * t[2]);
            var iT = [d * t[3], d * -t[1], d * -t[2], d * t[0], d * (t[2] * t[5] - t[3] * t[4]), d * (t[1] * t[4] - t[0] * t[5])];
            this.mouseR = [this.mouse[0] * iT[0] + this.mouse[1] * iT[2] + iT[4], this.mouse[0] * iT[1] + this.mouse[1] * iT[3] + iT[5]];
        };
        // Push mouse hit, if there is a snippet.
        ViewContext.prototype.pushHit = function (normalized) {
            if (normalized === void 0) { normalized = null; }
            if (this.picking && this.sV)
                this.hits.push(new MouseHit(this.sV.instance, this.mouseR, normalized));
        };
        // Delegate context functions, including interpolation.
        ViewContext.prototype.strokeStyle = function (color) {
            this.context.strokeStyle = this.tColor(color);
        };
        ViewContext.prototype.lineWidth = function (width) {
            this.context.lineWidth = this.t(width);
        };
        ViewContext.prototype.setLineDash = function (segments) {
            this.context.setLineDash(segments);
        };
        ViewContext.prototype.globalAlpha = function (alpha) {
            this.context.globalAlpha = this.t(alpha);
        };
        ViewContext.prototype.stroke = function () {
            this.context.stroke();
        };
        ViewContext.prototype.fillStyle = function (color) {
            this.context.fillStyle = this.tColor(color);
        };
        ViewContext.prototype.fill = function () {
            this.context.fill();
            // Mouse hit.
            if (this.context.isPointInPath(this.mouse[0], this.mouse[1]))
                this.pushHit();
        };
        ViewContext.prototype.translate = function (d) {
            this.context.translate(this.t(d[0]), this.t(d[1]));
            this.updateMouse();
            //this.translate(d[0], d[1]);
        };
        ViewContext.prototype.rotate = function (dr) {
            this.context.rotate(this.t(dr));
            this.updateMouse();
        };
        ViewContext.prototype.scale = function (dx, dy) {
            this.context.scale(this.t(dx), this.t(dy));
            this.updateMouse();
        };
        ViewContext.prototype.save = function () {
            this.context.save();
        };
        ViewContext.prototype.restore = function () {
            this.context.restore();
            this.updateMouse();
        };
        ViewContext.prototype.strokeRect = function (x, y, w, h) {
            this.context.strokeRect(this.t(x), this.t(y), this.t(w), this.t(h));
        };
        ViewContext.prototype.fillRect = function (x, y, w, h) {
            this.context.fillRect(this.t(x), this.t(y), this.t(w), this.t(h));
            // Mouse hit.
            if (x <= this.mouseR[0] && y <= this.mouseR[1] && this.mouseR[0] <= x + w && this.mouseR[1] <= y + h)
                this.pushHit([this.mouseR[0] / w, this.mouseR[1] / h]);
        };
        ViewContext.prototype.strokeRoundRect = function (x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.arcTo(x + width, y, x + width, y + height, radius);
            this.arcTo(x + width, y + height, x, y + height, radius);
            this.arcTo(x, y + height, x, y, radius);
            this.arcTo(x, y, x + width, y, radius);
            this.closePath();
            this.stroke();
        };
        ViewContext.prototype.fillRoundRect = function (x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.arcTo(x + width, y, x + width, y + height, radius);
            this.arcTo(x + width, y + height, x, y + height, radius);
            this.arcTo(x, y + height, x, y, radius);
            this.arcTo(x, y, x + width, y, radius);
            this.closePath();
            this.fill();
        };
        ViewContext.prototype.strokeLine = function (pos1, pos2) {
            this.context.beginPath();
            this.context.moveTo(this.t(pos1[0]), this.t(pos1[1]));
            this.context.lineTo(this.t(pos2[0]), this.t(pos2[1]));
            this.context.stroke();
        };
        ViewContext.prototype.strokeEllipse = function (cx, cy, rw, rh) {
            this.context.beginPath();
            this.context['ellipse'](this.t(cx), this.t(cy), this.t(rw), this.t(rh), 0, 2 * Math.PI, false);
            this.context.stroke();
        };
        ViewContext.prototype.fillEllipse = function (cx, cy, rw, rh) {
            this.context.beginPath();
            this.context['ellipse'](this.t(cx), this.t(cy), this.t(rw), this.t(rh), 0, 2 * Math.PI, false);
            this.context.fill();
            // Mouse hit.
            if (Vector.Euclidean(Vector.subtract([cx, cy], [this.mouseR[0], this.mouseR[1]])) <= 0.5 * (rw + rh))
                this.pushHit();
        };
        ViewContext.prototype.beginPath = function () {
            this.context.beginPath();
        };
        ViewContext.prototype.closePath = function () {
            this.context.closePath();
        };
        ViewContext.prototype.moveTo = function (x, y) {
            this.context.moveTo(this.t(x), this.t(y));
        };
        ViewContext.prototype.lineTo = function (x, y) {
            this.context.lineTo(this.t(x), this.t(y));
        };
        ViewContext.prototype.arcTo = function (x1, y1, x2, y2, radius) {
            this.context.arcTo(this.t(x1), this.t(y1), this.t(x2), this.t(y2), this.t(radius));
        };
        ViewContext.prototype.font = function (font) {
            this.context.font = font; // Do not interpolate; nasty scale effects are probable.
            this.fontHeight = Number(this.context.font.split("px")[0]);
        };
        ViewContext.prototype.fillText = function (text, x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.context.fillText(text, this.t(x), this.t(y));
            // Mouse hit.
            var w = this.context.measureText(text).width;
            if (x <= this.mouseR[0] && y - this.fontHeight <= this.mouseR[1] && this.mouseR[0] <= x + w && this.mouseR[1] <= y)
                this.pushHit();
        };
        ViewContext.prototype.strokeText = function (text, x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.context.strokeText(text, this.t(x), this.t(y));
            // Mouse hit.
            var w = this.context.measureText(text).width;
            if (x <= this.mouseR[0] && y - this.fontHeight <= this.mouseR[1] && this.mouseR[0] <= x + w && this.mouseR[1] <= y)
                this.pushHit();
        };
        ViewContext.prototype.textAlign = function (align) {
            this.context.textAlign = align;
        };
        ViewContext.prototype.textBaseline = function (baseline) {
            this.context.textBaseline = baseline;
        };
        ViewContext.prototype.drawImage = function (img, pos) {
            if (pos === void 0) { pos = [0, 0]; }
            if (img['originalWidth']) {
                this.drawImageScaled(img, pos, [img['originalWidth'], img['originalHeight']]);
            }
            else {
                var oldAlpha = this.context.globalAlpha;
                this.context.globalAlpha = this.sV.presence;
                this.context.drawImage(img, this.t(pos[0]), this.t(pos[1]));
                // Mouse hit.
                if (pos[0] <= this.mouseR[0] && pos[1] <= this.mouseR[1] && this.mouseR[0] <= pos[0] + img.width && this.mouseR[1] <= pos[1] + img.height)
                    this.pushHit();
                this.context.globalAlpha = oldAlpha;
            }
        };
        ViewContext.prototype.drawImageScaled = function (img, pos, dim) {
            var oldAlpha = this.context.globalAlpha;
            this.context.globalAlpha = this.sV.presence;
            this.context.drawImage(img, this.t(pos[0]), this.t(pos[1]), this.t(dim[0]), this.t(dim[1]));
            // Mouse hit.
            if (pos[0] <= this.mouseR[0] && pos[1] <= this.mouseR[1] && this.mouseR[0] <= pos[0] + dim[0] && this.mouseR[1] <= pos[1] + dim[1])
                this.pushHit();
            this.context.globalAlpha = oldAlpha;
        };
        ViewContext.prototype.drawImageClipped = function (img, spos, sdim, pos, dim) {
            var oldAlpha = this.context.globalAlpha;
            this.context.globalAlpha = this.sV.presence;
            this.context.drawImage(img, this.t(spos[0]), this.t(spos[1]), this.t(sdim[0]), this.t(sdim[1]), this.t(pos[0]), this.t(pos[1]), this.t(dim[0]), this.t(dim[1]));
            // Correct mouse coordinates for image scaling.
            this.mouseR = [this.mouseR[0] * sdim[0] / dim[0], this.mouseR[1] * sdim[1] / dim[1]];
            // Mouse hit. TODO: scale.
            if (pos[0] <= this.mouseR[0] && pos[1] <= this.mouseR[1] && this.mouseR[0] <= pos[0] + sdim[0] && this.mouseR[1] <= pos[1] + sdim[1])
                this.pushHit();
            this.context.globalAlpha = oldAlpha;
        };
        return ViewContext;
    })();
    exports.ViewContext = ViewContext;
    /**
     * Get transformation addition.
     * Copyright 2012- Takeshi Arabiki
     * License: MIT License (http://opensource.org/licenses/MIT)
     */
    (function () {
        CanvasRenderingContext2D.prototype["_transform"] = [1, 0, 0, 1, 0, 0];
        CanvasRenderingContext2D.prototype["_transforms"] = [];
        CanvasRenderingContext2D.prototype["getTransform"] = function () {
            return this._transform;
        };
        var restore = CanvasRenderingContext2D.prototype.restore;
        CanvasRenderingContext2D.prototype.restore = function () {
            this._transform = this._transforms.pop() || [1, 0, 0, 1, 0, 0];
            restore.apply(this);
        };
        // |   |   |                            | |   |
        // | x'|   | cos(angle)  -sin(angle)  0 | | x |
        // |   |   |                            | |   |
        // | y'| = | sin(angle)   cos(angle)  0 | | y |
        // |   |   |                            | |   |
        // | 1 |   |     0             0      1 | | 1 |
        // |   |   |                            | |   |
        var rotate = CanvasRenderingContext2D.prototype.rotate;
        CanvasRenderingContext2D.prototype.rotate = function (angle) {
            var t = [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];
            this._transform = multiplyTransform(this._transform, t);
            rotate.apply(this, arguments);
        };
        var save = CanvasRenderingContext2D.prototype.save;
        CanvasRenderingContext2D.prototype.save = function () {
            this._transforms.push(this._transform.slice());
            save.apply(this);
        };
        // |   |   |         | |   |
        // | x'|   | sx 0  0 | | x |
        // |   |   |         | |   |
        // | y'| = | 0  sy 0 | | y |
        // |   |   |         | |   |
        // | 1 |   | 0  0  1 | | 1 |
        // |   |   |         | |   |
        var scale = CanvasRenderingContext2D.prototype.scale;
        CanvasRenderingContext2D.prototype.scale = function (sx, sy) {
            this._transform = multiplyTransform(this._transform, [sx, 0, 0, sy, 0, 0]);
            scale.apply(this, arguments);
        };
        var setTransform = CanvasRenderingContext2D.prototype.setTransform;
        CanvasRenderingContext2D.prototype.setTransform = function (a, b, c, d, e, f) {
            this._transform = Array.prototype.slice.apply(arguments);
            setTransform.apply(this, arguments);
        };
        // |   |   |          | |   |
        // | x'|   | 1  0  tx | | x |
        // |   |   |          | |   |
        // | y'| = | 0  1  ty | | y |
        // |   |   |          | |   |
        // | 1 |   | 0  0  1  | | 1 |
        // |   |   |          | |   |
        var translate = CanvasRenderingContext2D.prototype.translate;
        CanvasRenderingContext2D.prototype.translate = function (tx, ty) {
            this._transform = multiplyTransform(this._transform, [1, 0, 0, 1, tx, ty]);
            translate.apply(this, arguments);
        };
        // |   |   |         | |   |
        // | x'|   | a  c  e | | x |
        // |   |   |         | |   |
        // | y'| = | b  d  f | | y |
        // |   |   |         | |   |
        // | 1 |   | 0  0  1 | | 1 |
        // |   |   |         | |   |
        var transform = CanvasRenderingContext2D.prototype.transform;
        CanvasRenderingContext2D.prototype.transform = function (a, b, c, d, e, f) {
            this._transform = multiplyTransform.call(this, this._transform, arguments);
            transform.apply(this, arguments);
        };
        // ctx.transform.apply(ctx, t1)
        // ctx.transform.apply(ctx, t2)
        // => ctx.transform.apply(ctx, multiplyTransform(t1, t2))
        var multiplyTransform = function (t1, t2) {
            return [
                t1[0] * t2[0] + t1[2] * t2[1],
                t1[1] * t2[0] + t1[3] * t2[1],
                t1[0] * t2[2] + t1[2] * t2[3],
                t1[1] * t2[2] + t1[3] * t2[3],
                t1[0] * t2[4] + t1[2] * t2[5] + t1[4],
                t1[1] * t2[4] + t1[3] * t2[5] + t1[5]
            ];
        };
    })();
});
//# sourceMappingURL=view.js.map