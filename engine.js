/// <reference path="test.ts"/>
function init() {
    var canv = document.createElement("canvas");
    canv.width = 1024;
    canv.height = 768;
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);
    testLookAt(ctx);
    // testPerspective(ctx);
    // testRasterize(ctx);
    // testScreen3d(ctx);
}
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
        return new Vector4(this.x + right.x, this.y + right.y, this.z + right.z);
    };
    Vector4.prototype.sub = function (right) {
        return new Vector4(this.x - right.x, this.y - right.y, this.z - right.z);
    };
    Vector4.prototype.multi = function (right) {
        return new Vector4(this.x * right, this.y * right, this.z * right);
    };
    Vector4.prototype.cross = function (right) {
        return new Vector4(this.y * right.z - this.z * right.y, this.z * right.x - this.x * right.z, this.x * right.y - this.y * right.x);
    };
    Vector4.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vector4.prototype.normalize = function () {
        var len = this.length();
        return new Vector4(this.x / len, this.y / len, this.z / len);
    };
    Vector4.prototype.clip = function () {
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
    return Matrix44;
})();
var Vertex = (function () {
    function Vertex(position, color) {
        if (position === void 0) { position = new Vector4; }
        if (color === void 0) { color = new Vector4; }
        this.position = position;
        this.color = color;
    }
    Object.defineProperty(Vertex.prototype, "x", {
        get: function () { return this.position.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "y", {
        get: function () { return this.position.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "z", {
        get: function () { return this.position.z; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "w", {
        get: function () { return this.position.w; },
        enumerable: true,
        configurable: true
    });
    Vertex.prototype.transform = function (m) {
        return new Vertex(this.position.transform(m), this.color);
    };
    return Vertex;
})();
var Camera = (function () {
    function Camera(fov, aspectRation, near, far) {
        var d = Math.tan(fov * 3.14 / 180 / 2);
        this.view2Clipping = new Matrix44();
        this.view2Clipping.set(0, 0, d / aspectRation);
        this.view2Clipping.set(1, 1, d);
        this.view2Clipping.set(2, 2, (far + near) / (near - far));
        this.view2Clipping.set(2, 3, -1);
        this.view2Clipping.set(3, 2, 2 * near * far / (near - far));
        this.view2Clipping.set(3, 3, 0);
    }
    Camera.prototype.lookAt = function (position, target, up) {
        var dir = target.sub(position);
        var right = dir.cross(up);
        var y = right.cross(dir);
        var v2w = new Matrix44();
        v2w.setColumn(0, right.normalize());
        v2w.setColumn(1, y.normalize());
        v2w.setColumn(2, dir.normalize().multi(-1));
        v2w.transpose();
        var translate = position.transform(v2w).multi(-1);
        v2w.setColumn(3, translate);
        this.world2View = v2w;
    };
    return Camera;
})();
var Screen3D = (function () {
    function Screen3D(width, height) {
        this.ndc2screen = new Matrix44();
        this.ndc2screen.set(0, 0, width / 2);
        this.ndc2screen.set(1, 1, -height / 2);
        this.ndc2screen.set(2, 2, 1 / 2);
        this.ndc2screen.set(3, 0, width / 2);
        this.ndc2screen.set(3, 1, height / 2);
        this.ndc2screen.set(3, 2, 1 / 2);
    }
    return Screen3D;
})();
/**
 * Given three points with:
 * - position in screen space
 * - color same as original
 * Draw the triangle
 */
function rasterize(p1, p2, p3, ctx) {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(p1.x, p1.y, 2, 2);
    ctx.fillRect(p2.x, p2.y, 2, 2);
    ctx.fillRect(p3.x, p3.y, 2, 2);
    var vertexArray = [p1, p2, p3];
    vertexArray.sort(function (a, b) { return a.position.y - b.position.y; });
    var pa = vertexArray[0];
    var pb = vertexArray[1];
    var pc = vertexArray[2];
    var diffY = pb.y - pa.y;
    /**
     * Y/X会导致不统一，换成X/Y
     */
    var gradientBC = (pc.x - pb.x) / (pc.y - pb.y);
    var gradientAB = (pb.x - pa.x) / (pb.y - pa.y);
    var gradientAC = (pc.x - pa.x) / (pc.y - pa.y);
    for (var y = 0; y < diffY; y++) {
        var t1 = y / (pb.y - pa.y);
        var t2 = y / (pc.y - pa.y);
        /**
         * 不取整会导致波纹效果
         */
        var sx = Math.ceil(pa.x + t1 * (pb.x - pa.x));
        var ex = Math.ceil(pa.x + t2 * (pc.x - pa.x));
        var csByZs = pa.color.multi((1 - t1) / pa.w).add(pb.color.multi(t1 / pb.w));
        var ceByZe = pa.color.multi((1 - t2) / pa.w).add(pc.color.multi(t2 / pc.w));
        var recipZs = (1 - t1) / pa.w + t1 / pb.w;
        var recipZe = (1 - t2) / pa.w + t2 / pc.w;
        if (gradientAC < gradientAB) {
            sx = [ex, ex = sx][0];
            csByZs = [ceByZe, ceByZe = csByZs][0];
            recipZs = [recipZe, recipZe = recipZs][0];
        }
        var diffX = ex - sx;
        for (var x = 0; x < diffX; x++) {
            var t3 = x / diffX;
            var recipZm = (1 - t3) * recipZs + t3 * recipZe;
            var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
            var cm = cmByzm.multi(1 / recipZm);
            /**
             * rgb里必须是整数
             */
            ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
            ctx.fillRect(x + sx, y + Math.ceil(pa.y), 1, 1);
        }
    }
    diffY = pc.y - pb.y;
    for (var y = 0; y < diffY; y++) {
        var t1 = (diffY - y) / (pc.y - pb.y);
        var t2 = (diffY - y) / (pc.y - pa.y);
        var sx = Math.ceil(pc.x + t1 * (pb.x - pc.x));
        var ex = Math.ceil(pc.x + t2 * (pa.x - pc.x));
        var csByZs = pc.color.multi((1 - t1) / pc.w).add(pb.color.multi(t1 / pb.w));
        var ceByZe = pc.color.multi((1 - t2) / pc.w).add(pa.color.multi(t2 / pa.w));
        var recipZs = (1 - t1) / pc.w + t1 / pb.w;
        var recipZe = (1 - t2) / pc.w + t2 / pa.w;
        /**
         * 三角形的下半部分，左边的边gradient更大
         */
        if (gradientBC < gradientAC) {
            sx = [ex, ex = sx][0];
            csByZs = [ceByZe, ceByZe = csByZs][0];
            recipZs = [recipZe, recipZe = recipZs][0];
        }
        var diffX = ex - sx;
        for (var x = 0; x < diffX; x++) {
            var t3 = x / diffX;
            var recipZm = (1 - t3) * recipZs + t3 * recipZe;
            var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
            var cm = cmByzm.multi(1 / recipZm);
            /**
             * rgb里必须是整数
             */
            ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
            ctx.fillRect(x + sx, y + Math.ceil(pb.y), 1, 1);
        }
    }
}
init();
//# sourceMappingURL=engine.js.map