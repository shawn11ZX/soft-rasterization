var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vector4 = (function () {
    function Vector4(x, y, z, w) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (w === void 0) { w = 1; }
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    Vector4.prototype.add = function (right) {
        return new Vector4(this.x + right.x, this.y + right.y, this.z + right.z, this.w + right.w);
    };
    Vector4.prototype.sub = function (right) {
        return new Vector4(this.x - right.x, this.y - right.y, this.z - right.z, this.w - right.w);
    };
    Vector4.prototype.multi = function (right) {
        return new Vector4(this.x * right, this.y * right, this.z * right, this.w * right);
    };
    Vector4.prototype.cross = function (right) {
        return new Vector4(this.y * right.z - this.z * right.y, this.z * right.x - this.x * right.z, this.x * right.y - this.y * right.x, 0);
    };
    Vector4.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    Vector4.prototype.dot = function (right) {
        return this.x * right.x + this.y * right.y + this.z * right.z + this.w * right.w;
    };
    Vector4.prototype.normalize = function () {
        var len = this.length();
        return new Vector4(this.x / len, this.y / len, this.z / len, this.w / len);
    };
    Vector4.prototype.perspectiveDivide = function () {
        return new Vector4(this.x / this.w, this.y / this.w, this.z / this.w, 1);
    };
    Vector4.prototype.transform = function (m) {
        var x = this.x * m.get(0, 0) + this.y * m.get(1, 0) + this.z * m.get(2, 0) + this.w * m.get(3, 0);
        var y = this.x * m.get(0, 1) + this.y * m.get(1, 1) + this.z * m.get(2, 1) + this.w * m.get(3, 1);
        var z = this.x * m.get(0, 2) + this.y * m.get(1, 2) + this.z * m.get(2, 2) + this.w * m.get(3, 2);
        var w = this.x * m.get(0, 3) + this.y * m.get(1, 3) + this.z * m.get(2, 3) + this.w * m.get(3, 3);
        return new Vector4(x, y, z, w);
    };
    return Vector4;
})();
var Matrix44 = (function () {
    function Matrix44() {
        /** column major */
        this.data = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.data[0] = 1;
        this.data[5] = 1;
        this.data[10] = 1;
        this.data[15] = 1;
    }
    Matrix44.prototype.set = function (column, row, value) {
        this.data[column * 4 + row] = value;
    };
    Matrix44.prototype.get = function (column, row) {
        return this.data[column * 4 + row];
    };
    Matrix44.prototype.setColumn = function (column, v) {
        this.data[column * 4 + 0] = v.x;
        this.data[column * 4 + 1] = v.y;
        this.data[column * 4 + 2] = v.z;
        this.data[column * 4 + 3] = v.w;
    };
    Matrix44.prototype.transpose = function () {
        for (var c = 0; c < 4; c++) {
            for (var r = c; r < 4; r++) {
                var t = this.data[c * 4 + r];
                this.data[c * 4 + r] = this.data[r * 4 + c];
                this.data[r * 4 + c] = t;
            }
        }
    };
    Matrix44.prototype.scale = function (x, y, z) {
        this.set(0, 0, this.get(0, 0) * x);
        this.set(1, 1, this.get(1, 1) * y);
        this.set(2, 2, this.get(2, 2) * z);
    };
    Matrix44.prototype.translate = function (x, y, z) {
        this.set(3, 0, this.get(3, 0) + x);
        this.set(3, 1, this.get(3, 1) + y);
        this.set(3, 2, this.get(3, 2) + z);
    };
    Matrix44.createRotateY = function (angle) {
        var m = new Matrix44();
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        m.set(0, 0, cos);
        m.set(0, 2, -1 * sin);
        m.set(2, 0, sin);
        m.set(2, 2, cos);
        return m;
    };
    return Matrix44;
})();
var Vertex3D = (function () {
    function Vertex3D(position, color, uv) {
        if (position === void 0) { position = new Vector4(); }
        if (color === void 0) { color = new Vector4(); }
        if (uv === void 0) { uv = new Vector4(); }
        this.position = position;
        this.color = color;
        this.uv = uv;
    }
    Object.defineProperty(Vertex3D.prototype, "x", {
        get: function () { return this.position.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "y", {
        get: function () { return this.position.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "z", {
        get: function () { return this.position.z; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "w", {
        get: function () { return this.position.w; },
        enumerable: true,
        configurable: true
    });
    return Vertex3D;
})();
var Camera3D = (function () {
    function Camera3D(screen, fov, aspectRation, near, far) {
        var _this = this;
        this.screen = screen;
        var d = Math.tan(fov / 2);
        this.view2Clipping = new Matrix44();
        this.view2Clipping.set(0, 0, d / aspectRation);
        this.view2Clipping.set(1, 1, d);
        this.view2Clipping.set(2, 2, (far + near) / (near - far));
        this.view2Clipping.set(2, 3, -1);
        this.view2Clipping.set(3, 2, 2 * near * far / (near - far));
        this.view2Clipping.set(3, 3, 0);
        window.addWheelListener(screen.canvas, function (e) { return _this.onZoom(e); });
    }
    Camera3D.prototype.onZoom = function (event) {
        var length = this.target.sub(this.position).length();
        this.position = this.target.add(this.position.sub(this.target).multi((length + event.deltaY / 10) / length));
        this.lookAt(this.position, this.target, this.up);
        console.log(length);
    };
    Camera3D.prototype.lookAt = function (position, target, up) {
        this.position = position;
        this.target = target;
        this.up = up;
        var dir = target.sub(position);
        var right = dir.cross(up);
        var y = right.cross(dir);
        var v2w = new Matrix44();
        v2w.setColumn(0, right.normalize());
        v2w.setColumn(1, y.normalize());
        v2w.setColumn(2, dir.normalize().multi(-1));
        v2w.transpose();
        // 不能直接用position
        var translate = position.transform(v2w).multi(-1);
        translate.w = 1;
        v2w.setColumn(3, translate);
        this.world2View = v2w;
    };
    return Camera3D;
})();
var RenderMode;
(function (RenderMode) {
    RenderMode[RenderMode["Color"] = 0] = "Color";
    RenderMode[RenderMode["Texture"] = 1] = "Texture";
    RenderMode[RenderMode["Wireframe"] = 2] = "Wireframe";
})(RenderMode || (RenderMode = {}));
var Screen3D = (function () {
    function Screen3D(width, height) {
        this.ndc2screen = new Matrix44();
        this.ndc2screen.set(0, 0, width / 2);
        this.ndc2screen.set(1, 1, -height / 2);
        this.ndc2screen.set(2, 2, 1 / 2);
        this.ndc2screen.set(3, 0, width / 2);
        this.ndc2screen.set(3, 1, height / 2);
        this.ndc2screen.set(3, 2, 1 / 2);
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        this.offline_canvas = document.createElement("canvas");
        this.offline_canvas.width = width;
        this.offline_canvas.height = height;
        this.offline_ctx = this.offline_canvas.getContext("2d");
        this.imageData = this.offline_ctx.createImageData(width, height);
        this.rasterizer = new Rasterizer(this.imageData);
    }
    Screen3D.prototype.commit = function () {
        this.ctx.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
    };
    return Screen3D;
})();
var Rasterizer = (function () {
    function Rasterizer(imageData) {
        this.imageData = imageData;
        this.zbuf = new Array(imageData.data.length / 4);
    }
    Rasterizer.prototype.prepare = function () {
        for (var i = 0; i < this.imageData.data.length; i++) {
            this.imageData.data[i] = 0xee;
        }
        for (var i = 0; i < this.zbuf.length; i++) {
            this.zbuf[i] = 0xffffffff;
        }
    };
    Rasterizer.prototype.rasterizeTrapezoid = function (startY, endY, leftTop, leftBtm, rightTop, rightBtm) {
        var r, g, b, a;
        for (var y = startY; y < endY; y++) {
            var t1 = (y - leftTop.y) / (leftBtm.y - leftTop.y);
            var t2 = (y - rightTop.y) / (rightBtm.y - rightTop.y);
            if (t1 < 0)
                t1 = 0;
            if (t2 < 0)
                t2 = 0;
            /**
             * 不取整会导致波纹效果
             */
            var sx = leftTop.x + t1 * (leftBtm.x - leftTop.x);
            var ex = rightTop.x + t2 * (rightBtm.x - rightTop.x);
            var csByZs;
            var ceByZe;
            if (this.mode == RenderMode.Color) {
                csByZs = leftTop.color.multi((1 - t1) / leftTop.w).add(leftBtm.color.multi(t1 / leftBtm.w));
                ceByZe = rightTop.color.multi((1 - t2) / rightTop.w).add(rightBtm.color.multi(t2 / rightBtm.w));
            }
            else if (this.mode == RenderMode.Texture) {
                csByZs = leftTop.uv.multi((1 - t1) / leftTop.w).add(leftBtm.uv.multi(t1 / leftBtm.w));
                ceByZe = rightTop.uv.multi((1 - t2) / rightTop.w).add(rightBtm.uv.multi(t2 / rightBtm.w));
            }
            var recipZs = (1 - t1) / leftTop.w + t1 / leftBtm.w;
            var recipZe = (1 - t2) / rightTop.w + t2 / rightBtm.w;
            var roundsx = Math.round(sx);
            var roundex = Math.round(ex);
            var diffX = ex - sx;
            for (var x = roundsx; x < roundex; x++) {
                var t3 = (x - sx) / diffX;
                if (t3 < 0)
                    t3 = 0;
                var Zm = 1 / ((1 - t3) * recipZs + t3 * recipZe);
                if (Zm < this.zbuf[y * this.imageData.width + x]) {
                    this.zbuf[y * this.imageData.width + x] = Zm;
                }
                else {
                    continue;
                }
                var cmByzm = csByZs.multi((1 - t3)).add(ceByZe.multi(t3));
                var cm = cmByzm.multi(Zm);
                /**
                 * rgb里必须是整数
                 */
                if (this.mode == RenderMode.Color) {
                    r = Math.min(255, Math.ceil(cm.x));
                    g = Math.min(255, Math.ceil(cm.y));
                    b = Math.min(255, Math.ceil(cm.z));
                    a = Math.min(255, Math.ceil(cm.w));
                }
                else {
                    var color = this.texture.pick(cm.x, cm.y);
                    r = color.x;
                    g = color.y;
                    b = color.z;
                    a = color.w;
                }
                // y is row
                var offset = 4 * (y * this.imageData.width + x);
                this.imageData.data[offset + 0] = r;
                this.imageData.data[offset + 1] = g;
                this.imageData.data[offset + 2] = b;
                this.imageData.data[offset + 3] = a;
            }
        }
    };
    /**
     * Given three points with:
    * - position in screen space
    * - color same as original
    * Draw the triangle
    */
    Rasterizer.prototype.rasterizeTriangle = function (p1, p2, p3) {
        // this.ctx.fillStyle = "rgb(255,255,255)";
        // this.ctx.fillRect(p1.x, p1.y, 2, 2);
        // this.ctx.fillRect(p2.x, p2.y, 2, 2);
        // this.ctx.fillRect(p3.x, p3.y, 2, 2);
        var vertexArray = [p1, p2, p3];
        vertexArray.sort(function (a, b) { return a.position.y - b.position.y; });
        var pa = vertexArray[0];
        var pb = vertexArray[1];
        var pc = vertexArray[2];
        var diffYup = Math.ceil(pb.y - pa.y);
        /**
         * Y/X会导致不统一，换成X/Y
         */
        var gradientBC = (pc.x - pb.x) / (pc.y - pb.y);
        var gradientAB = (pb.x - pa.x) / (pb.y - pa.y);
        var gradientAC = (pc.x - pa.x) / (pc.y - pa.y);
        var roundAy = Math.round(pa.y);
        var roundBy = Math.round(pb.y);
        var roundCy = Math.round(pc.y);
        if (gradientAC < gradientAB) {
            this.rasterizeTrapezoid(roundAy, roundBy, pa, pc, pa, pb);
        }
        else {
            this.rasterizeTrapezoid(roundAy, roundBy, pa, pb, pa, pc);
        }
        if (gradientBC < gradientAC) {
            this.rasterizeTrapezoid(roundBy, roundCy, pa, pc, pb, pc);
        }
        else {
            this.rasterizeTrapezoid(roundBy, roundCy, pb, pc, pa, pc);
        }
    };
    return Rasterizer;
})();
var Object3D = (function () {
    function Object3D() {
        this.surfaceList = new Array();
        this.renderMode = RenderMode.Texture;
        this.matrix = new Matrix44;
    }
    return Object3D;
})();
var Surface3D = (function () {
    function Surface3D() {
        this.vertexArray = new Array();
        this.indexArray = new Array();
    }
    return Surface3D;
})();
var Cube3D = (function (_super) {
    __extends(Cube3D, _super);
    function Cube3D() {
        _super.call(this);
        var v0 = new Vector4(-1, 1, 1);
        var v1 = new Vector4(1, 1, 1);
        var v2 = new Vector4(-1, -1, 1);
        var v3 = new Vector4(1, -1, 1);
        var v4 = new Vector4(-1, 1, -1);
        var v5 = new Vector4(1, 1, -1);
        var v6 = new Vector4(-1, -1, -1);
        var v7 = new Vector4(1, -1, -1);
        var surface;
        var texture = new Texture3D(256, 256, "texture.png");
        // Front
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        // Back
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        // Right
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        // Left
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        // top
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        // bottom
        surface = new Surface3D();
        surface.texture = texture;
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
    }
    return Cube3D;
})(Object3D);
/*
 * Y is up
 */
var SphericalCoodinate = (function () {
    function SphericalCoodinate() {
    }
    SphericalCoodinate.prototype.fromCartesian = function (v) {
        this.length = v.length();
        this.theta = Math.atan2(v.z, v.x);
        this.phy = Math.atan2(Math.sqrt(v.x * v.x + v.z * v.z), v.y);
    };
    SphericalCoodinate.prototype.toCartesian = function () {
        var r = this.length * Math.sin(this.phy);
        var y = this.length * Math.cos(this.phy);
        var x = r * Math.cos(this.theta);
        var z = r * Math.sin(this.theta);
        var v = new Vector4(x, y, z);
        return v;
    };
    return SphericalCoodinate;
})();
var Texture3D = (function () {
    function Texture3D(width, height, src) {
        var _this = this;
        if (src === void 0) { src = null; }
        this.height = height;
        this.width = width;
        this.img = new Image(width, height);
        if (src != null) {
            //this.img = <HTMLImageElement>document.getElementById(src);
            //this.onLoadImage(null);
            this.img.onload = function (ev) { return _this.onLoadImage(ev); };
            this.img.src = src;
        }
        else {
            this.initDefaultTexture(width, height);
        }
    }
    Texture3D.prototype.initDefaultTexture = function (width, height) {
        this.loaded = true;
        this.rawData = new Array();
        for (var j = 0; j < width; j++) {
            for (var i = 0; i < height; i++) {
                var x = i / 32;
                var y = j / 32;
                var offset = 4 * (j * this.width + i);
                if (((x + y) & 1) == 1) {
                    this.rawData[offset + 0] = 0x3f;
                    this.rawData[offset + 1] = 0xbc;
                    this.rawData[offset + 2] = 0xef;
                    this.rawData[offset + 3] = 0xff;
                }
                else {
                    this.rawData[offset + 0] = 0xee;
                    this.rawData[offset + 1] = 0xee;
                    this.rawData[offset + 2] = 0xee;
                    this.rawData[offset + 3] = 0xff;
                }
            }
        }
    };
    Texture3D.prototype.pick = function (u, v) {
        if (this.loaded) {
            var row = Math.round(u * (this.width));
            var col = Math.round(v * (this.height));
            if (row < 0)
                row = 0;
            if (row >= this.width)
                row = this.width - 1;
            if (col < 0)
                col = 0;
            if (col >= this.height)
                col = this.height - 1;
            var offset = 4 * (row * this.width + col);
            return new Vector4(this.rawData[offset + 0], this.rawData[offset + 1], this.rawData[offset + 2], this.rawData[offset + 3]);
        }
        else {
            return new Vector4(255, 0, 0);
        }
    };
    Texture3D.prototype.onLoadImage = function (ev) {
        try {
            var tmp_canvas = document.createElement("canvas");
            tmp_canvas.width = this.width;
            tmp_canvas.height = this.height;
            var tmp_context = tmp_canvas.getContext('2d');
            tmp_context.drawImage(this.img, 0, 0);
            this.rawData = tmp_context.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height).data;
            this.loaded = true;
        }
        catch (Error) {
            this.initDefaultTexture(this.width, this.height);
        }
    };
    return Texture3D;
})();
var ClippAlgorithm = (function () {
    function ClippAlgorithm() {
    }
    /**
     * in homogenouse space
     */
    ClippAlgorithm.clip = function (pc0, pc1, pc2) {
        var inputVertexList = new Array();
        var outputVertexList = new Array();
        inputVertexList.push(pc1);
        inputVertexList.push(pc2);
        inputVertexList.push(pc0);
        var prevPoint = pc0;
        var prevVisible = this.isVisible(pc0);
        for (var i = 0; i < inputVertexList.length; i++) {
            var curPoint = inputVertexList[i];
            var curVisible = this.isVisible(curPoint);
            if (prevVisible && curVisible) {
                outputVertexList.push(prevPoint);
            }
            else if (prevVisible && !curVisible) {
                var t = this.getPercent(prevPoint.position, curPoint.position);
                outputVertexList.push(prevPoint);
                outputVertexList.push(this.getIntersection(prevPoint, curPoint));
            }
            else if (!prevVisible && curVisible) {
                var t = this.getPercent(curPoint.position, prevPoint.position);
                outputVertexList.push(this.getIntersection(curPoint, prevPoint));
            }
            prevPoint = curPoint;
            prevVisible = curVisible;
        }
        var rc = new Array();
        if (outputVertexList.length >= 3) {
            var triangle = new Array();
            triangle.push(outputVertexList[0], outputVertexList[1], outputVertexList[2]);
            rc.push(triangle);
            if (outputVertexList.length >= 4) {
                var triangle = new Array();
                triangle.push(outputVertexList[0], outputVertexList[2], outputVertexList[3]);
                rc.push(triangle);
            }
        }
        return rc;
    };
    ClippAlgorithm.getIntersection = function (pInside, pOutside) {
        var t = this.getPercent(pInside.position, pOutside.position);
        var newPoint = pInside.position.multi(t).add(pOutside.position.multi(1 - t));
        var newColor = pInside.color.multi(t).add(pOutside.color.multi(1 - t));
        var newUv = pInside.uv.multi(t).add(pOutside.uv.multi(1 - t));
        return new Vertex3D(newPoint, newColor, newUv);
    };
    ClippAlgorithm.getPercent = function (pInside, pOutside) {
        var t = 0;
        if (pOutside.x <= -1 * pOutside.w) {
            t = Math.max(t, (pOutside.x + pOutside.w) / ((pOutside.x + pOutside.w) - (pInside.x + pInside.w)));
        }
        if (pOutside.x >= pOutside.w) {
            t = Math.max(t, (pOutside.x - pOutside.w) / ((pOutside.x - pOutside.w) - (pInside.x - pInside.w)));
        }
        if (pOutside.y <= -1 * pOutside.w) {
            t = Math.max(t, (pOutside.y + pOutside.w) / ((pOutside.y + pOutside.w) - (pInside.y + pInside.w)));
        }
        if (pOutside.y >= pOutside.w) {
            t = Math.max(t, (pOutside.y - pOutside.w) / ((pOutside.y - pOutside.w) - (pInside.y - pInside.w)));
        }
        if (pOutside.z <= -1 * pOutside.w) {
            t = Math.max(t, (pOutside.z + pOutside.w) / ((pOutside.z + pOutside.w) - (pInside.z + pInside.w)));
        }
        if (pOutside.z >= pOutside.w) {
            t = Math.max(t, (pOutside.z - pOutside.w) / ((pOutside.z - pOutside.w) - (pInside.z - pInside.w)));
        }
        return t;
    };
    ClippAlgorithm.isVisible = function (v) {
        return (v.x <= v.w) && (v.x >= -1 * v.w)
            && (v.y <= v.w) && (v.y >= v.w * -1) && (v.z <= v.w) && (v.z >= v.w * -1);
    };
    return ClippAlgorithm;
})();
var Scene3D = (function () {
    function Scene3D(camer, screen) {
        this.objectArray = new Array();
        this.camera = camer;
        this.screen = screen;
    }
    Scene3D.prototype.addObject = function (obj) {
        this.objectArray.push(obj);
    };
    Scene3D.prototype.render = function (mode) {
        var _this = this;
        this.screen.rasterizer.prepare();
        for (var o = 0; o < this.objectArray.length; o++) {
            var obj = this.objectArray[o];
            this.screen.rasterizer.mode = obj.renderMode;
            for (var s = 0; s < obj.surfaceList.length; s++) {
                var surface = obj.surfaceList[s];
                this.screen.rasterizer.texture = surface.texture;
                this.screen.rasterizer.imageData = this.screen.imageData;
                var vertexArray = surface.vertexArray;
                var indexArray = surface.indexArray;
                var triangleNum = indexArray.length / 3;
                for (var i = 0; i < triangleNum; i++) {
                    var i0 = indexArray[i * 3 + 0];
                    var i1 = indexArray[i * 3 + 1];
                    var i2 = indexArray[i * 3 + 2];
                    var pm0 = vertexArray[i0];
                    var pm1 = vertexArray[i1];
                    var pm2 = vertexArray[i2];
                    var pv0 = pm0.position.transform(obj.matrix).transform(this.camera.world2View);
                    var pv1 = pm1.position.transform(obj.matrix).transform(this.camera.world2View);
                    var pv2 = pm2.position.transform(obj.matrix).transform(this.camera.world2View);
                    var normal = pv0.sub(pv1).cross(pv0.sub(pv2));
                    if (pv0.dot(normal) < 0) {
                        var pc0 = pv0.transform(this.camera.view2Clipping);
                        var pc1 = pv1.transform(this.camera.view2Clipping);
                        var pc2 = pv2.transform(this.camera.view2Clipping);
                        var pcList = ClippAlgorithm.clip(new Vertex3D(pc0, pm0.color, pm0.uv), new Vertex3D(pc1, pm1.color, pm1.uv), new Vertex3D(pc2, pm2.color, pm2.uv));
                        this.rasterizeTriangles(pcList);
                    }
                }
            }
        }
        this.screen.commit();
        requestAnimationFrame(function () { return _this.render(mode); });
    };
    Scene3D.prototype.rasterizeTriangles = function (pcList) {
        for (var i = 0; i < pcList.length; i++) {
            var psList = this.clipToScreen(pcList[i]);
            this.screen.rasterizer.rasterizeTriangle(psList[0], psList[1], psList[2]);
        }
    };
    Scene3D.prototype.clipToScreen = function (pcList) {
        var psList = new Array();
        for (var j = 0; j < pcList.length; j++) {
            var pc = pcList[j];
            var ps = pc.position.perspectiveDivide().transform(this.screen.ndc2screen);
            ps.w = pc.w;
            psList.push(new Vertex3D(ps, pc.color, pc.uv));
        }
        return psList;
    };
    Scene3D.prototype.start = function (mode) {
        var _this = this;
        requestAnimationFrame(function () { return _this.render(mode); });
        window.addEventListener("keypress", function (e) { return _this.onKeyDown(e); }, false);
    };
    Scene3D.prototype.onKeyDown = function (e) {
        //W
        if (e.charCode == 'w'.charCodeAt(0)) {
            var v = this.camera.position.sub(this.camera.target);
            var s = new SphericalCoodinate();
            s.fromCartesian(v);
            s.phy += -5 * 3.14 / 180;
            if (s.phy < 0)
                return;
            v = s.toCartesian();
            var newPosition = this.camera.target.add(v);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
        }
        // S
        if (e.charCode == 's'.charCodeAt(0)) {
            var v = this.camera.position.sub(this.camera.target);
            var s = new SphericalCoodinate();
            s.fromCartesian(v);
            s.phy += 5 * 3.14 / 180;
            if (s.phy > 3.14)
                return;
            v = s.toCartesian();
            var newPosition = this.camera.target.add(v);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
        }
        // A
        if (e.charCode == 'a'.charCodeAt(0)) {
            var m = Matrix44.createRotateY(-5 * 3.14 / 180);
            var newDir = this.camera.position.sub(this.camera.target).transform(m);
            var newPosition = this.camera.target.add(newDir);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
            console.log("5");
        }
        // D
        if (e.charCode == 'd'.charCodeAt(0)) {
            var m = Matrix44.createRotateY(5 * 3.14 / 180);
            var newDir = this.camera.position.sub(this.camera.target).transform(m);
            var newPosition = this.camera.target.add(newDir);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
            console.log("-5");
        }
    };
    return Scene3D;
})();
//# sourceMappingURL=engine.js.map