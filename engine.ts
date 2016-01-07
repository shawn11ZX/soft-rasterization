/// <reference path="test.ts"/>




class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public add(right: Vector4): Vector4 {
        return new Vector4(this.x + right.x, this.y + right.y, this.z + right.z, this.w + right.w);
    }

    public sub(right: Vector4): Vector4 {
        return new Vector4(this.x - right.x, this.y - right.y, this.z - right.z, this.w - right.w);
    }
    public multi(right: number): Vector4 {
        return new Vector4(this.x * right, this.y * right, this.z * right, this.w * right);
    }
    public cross(right: Vector4): Vector4 {
        return new Vector4(this.y * right.z - this.z * right.y, this.z * right.x - this.x * right.z, this.x * right.y - this.y * right.x, 0);
    }

    public length(): number {
        return Math.sqrt(this.dot(this));
    }

    public dot(right: Vector4): number {
        return this.x * right.x + this.y * right.y + this.z * right.z + this.w * right.w;
    }
    public normalize(): Vector4 {
        var len = this.length();
        return new Vector4(this.x / len, this.y / len, this.z / len);
    }
    public clip(): Vector4 {
        return new Vector4(this.x / this.w, this.y / this.w, this.z / this.w, 1);
    }

    public transform(m: Matrix44): Vector4 {
        var x = this.x * m.get(0, 0) + this.y * m.get(1, 0) + this.z * m.get(2, 0) + this.w * m.get(3, 0);
        var y = this.x * m.get(0, 1) + this.y * m.get(1, 1) + this.z * m.get(2, 1) + this.w * m.get(3, 1);
        var z = this.x * m.get(0, 2) + this.y * m.get(1, 2) + this.z * m.get(2, 2) + this.w * m.get(3, 2);
        var w = this.x * m.get(0, 3) + this.y * m.get(1, 3) + this.z * m.get(2, 3) + this.w * m.get(3, 3);
        return new Vector4(x, y, z, w);
    }
}

class Matrix44 {
    
    /** column major */
    private data: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    constructor() {
        this.data[0] = 1;
        this.data[5] = 1;
        this.data[10] = 1;
        this.data[15] = 1;
    }

    public set(column: number, row: number, value: number) {
        this.data[column * 4 + row] = value;
    }

    public get(column: number, row: number) {
        return this.data[column * 4 + row];
    }

    public setColumn(column: number, v: Vector4) {
        this.data[column * 4 + 0] = v.x;
        this.data[column * 4 + 1] = v.y;
        this.data[column * 4 + 2] = v.z;
        this.data[column * 4 + 3] = v.w;
    }

    public transpose() {
        for (var c = 0; c < 4; c++) {
            for (var r = c; r < 4; r++) {
                var t = this.data[c * 4 + r];
                this.data[c * 4 + r] = this.data[r * 4 + c];
                this.data[r * 4 + c] = t;
            }
        }
    }

    public scale(x: number, y: number, z: number) {
        this.set(0, 0, this.get(0, 0) * x);
        this.set(1, 1, this.get(1, 1) * y);
        this.set(2, 2, this.get(2, 2) * z);
    }
    
    public translate(x: number, y: number, z: number) {
        this.set(3, 0, this.get(3, 0) + x);
        this.set(3, 1, this.get(3, 1) + y);
        this.set(3, 2, this.get(3, 2) + z);
    }

    public static createRotateY(angle: number): Matrix44 {
        var m = new Matrix44();
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        m.set(0, 0, cos);
        m.set(0, 2, -1 * sin);
        m.set(2, 0, sin);
        m.set(2, 2, cos);
        return m;
    }

    x: Vector4;
    y: Vector4;
    z: Vector4;
    w: Vector4;
}

class Vertex3D {
    position: Vector4;
    color: Vector4;
    uv: Vector4;

    constructor(position: Vector4 = new Vector4(), color: Vector4 = new Vector4(), uv = new Vector4()) {
        this.position = position;
        this.color = color;
        this.uv = uv;
    }
    get x(): number { return this.position.x; }
    get y(): number { return this.position.y; }
    get z(): number { return this.position.z; }
    get w(): number { return this.position.w; }


}

class Camera3D {
    world2View: Matrix44;
    view2Clipping: Matrix44;
    position: Vector4;
    target: Vector4;
    up: Vector4;
    screen: Screen3D;
    constructor(screen: Screen3D, fov: number, aspectRation: number, near: number, far: number) {
        this.screen = screen;
        var d = Math.tan(fov / 2);
        this.view2Clipping = new Matrix44();

        this.view2Clipping.set(0, 0, d / aspectRation);
        this.view2Clipping.set(1, 1, d);
        this.view2Clipping.set(2, 2, (far + near) / (near - far));
        this.view2Clipping.set(2, 3, -1);
        this.view2Clipping.set(3, 2, 2 * near * far / (near - far));
        this.view2Clipping.set(3, 3, 0);

        window.addWheelListener(screen.canvas, (e) => this.onZoom(e));
    }

    private onZoom(event) {

        var length = this.target.sub(this.position).length();
        this.position = this.target.add(this.position.sub(this.target).multi((length + event.deltaY / 10) / length));
        this.lookAt(this.position, this.target, this.up);
        console.log(length);
    }


    public lookAt(position: Vector4, target: Vector4, up: Vector4) {
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

        var translate = position.transform(v2w).multi(-1);
        v2w.setColumn(3, translate);

        this.world2View = v2w;
    }
}
enum RenderMode { Color, Texture, Wireframe }
class Screen3D {
    ndc2screen: Matrix44;
    
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    
    offline_canvas: HTMLCanvasElement;
    offline_ctx: CanvasRenderingContext2D;
    
    imageData:ImageData;
    
    rasterizer:Rasterizer;
    
    constructor(width: number, height: number) {
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
    
    commit() {   
        this.ctx.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
    }
    

    round(n: number): number {
        if (n - Math.floor(n) > 0.5)
            n = Math.floor(n) + 1;
        else
            n = Math.floor(n);
        return n;
    }

}
class Rasterizer {
    mode: RenderMode;
    
    texture:Texture3D;
    imageData:ImageData;
    zbuf:number[];
    
    constructor(imageData:ImageData) {
        
        this.imageData = imageData;
        this.zbuf = new Array(imageData.data.length/4);
    }
    
    prepare() {
        
        for (var i = 0; i < this.imageData.data.length; i++) {
            this.imageData.data[i] = 0;
        }
        
        for (var i = 0; i < this.zbuf.length; i++) {
            this.zbuf[i] = 0xffffffff;
        }
    }
    
    rasterizeBetweenLineSeg(startY: number, endY: number, leftTop: Vertex3D, leftBtm: Vertex3D, rightTop: Vertex3D, rightBtm: Vertex3D) {
        
        var r:number, g:number, b:number, a:number;
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


            var csByZs: Vector4;
            var ceByZe: Vector4;
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
                if (t3 < 0) t3 = 0;

                var Zm = 1 / ((1 - t3) * recipZs + t3 * recipZe);
                
                if (Zm < this.zbuf[y*this.imageData.width + x]) {
                    this.zbuf[y*this.imageData.width + x] = Zm;
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


    }
    /**
     * Given three points with:
    * - position in screen space
    * - color same as original
    * Draw the triangle 
    */
    rasterize(p1: Vertex3D, p2: Vertex3D, p3: Vertex3D) {
        
        
        // this.ctx.fillStyle = "rgb(255,255,255)";
        // this.ctx.fillRect(p1.x, p1.y, 2, 2);
        // this.ctx.fillRect(p2.x, p2.y, 2, 2);
        // this.ctx.fillRect(p3.x, p3.y, 2, 2);

        var vertexArray: Array<Vertex3D> = [p1, p2, p3];
        vertexArray.sort((a, b) => a.position.y - b.position.y);
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
            this.rasterizeBetweenLineSeg(roundAy, roundBy, pa, pc, pa, pb);
        }
        else {
            this.rasterizeBetweenLineSeg(roundAy, roundBy, pa, pb, pa, pc);   
        }
        
        if (gradientBC < gradientAC) {
            this.rasterizeBetweenLineSeg(roundBy, roundCy, pa, pc, pb, pc);
        }
        else {
            this.rasterizeBetweenLineSeg(roundBy, roundCy, pb, pc, pa, pc);
        }

    }
}



class Object3D {
    surfaceList: Surface3D[] = new Array();
    renderMode:RenderMode = RenderMode.Texture;    
    matrix: Matrix44 = new Matrix44;
}


class Surface3D {
    vertexArray: Vertex3D[] = new Array();
    indexArray: number[] = new Array();
    texture: Texture3D;
}

class Cube3D extends Object3D {
     
    
    constructor() {
        super();
        var v0 = new Vector4(-1, 1, 1);
        var v1 = new Vector4(1, 1, 1);
        var v2 = new Vector4(-1, -1, 1);
        var v3 = new Vector4(1, -1, 1);
        var v4 = new Vector4(-1, 1, -1);
        var v5 = new Vector4(1, 1, -1);
        var v6 = new Vector4(-1, -1, -1);
        var v7 = new Vector4(1, -1, -1);
        
        var surface:Surface3D;
        
        // Front
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        
        // Back
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);
        
        // Right
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);

        // LEft
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);        
        
        // top
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v4, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v5, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v0, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v1, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface); 
        
        // bottom
        surface = new Surface3D();
        surface.texture = new Texture3D(256, 256);
        surface.vertexArray.push(new Vertex3D(v2, new Vector4(255, 0, 0, 255), new Vector4(0, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v3, new Vector4(0, 255, 0, 255), new Vector4(1, 0, 0)));
        surface.vertexArray.push(new Vertex3D(v6, new Vector4(0, 0, 255, 255), new Vector4(0, 1, 0)));
        surface.vertexArray.push(new Vertex3D(v7, new Vector4(255, 255, 255, 255), new Vector4(1, 1, 0)));
        
        surface.indexArray.push(0, 2, 3);
        surface.indexArray.push(0, 3, 1);
        this.surfaceList.push(surface);     
    }
}


/*
 * Y is up
 */

class SphericalCoodinate {
    theta: number; // in radius
    length: number;
    phy: number;

    fromCartesian(v: Vector4) {
        this.length = v.length();
        this.theta = Math.atan2(v.z, v.x);
        this.phy = Math.atan2(Math.sqrt(v.x * v.x + v.z * v.z), v.y);
    }

    toCartesian(): Vector4 {
        var r = this.length * Math.sin(this.phy);
        var y = this.length * Math.cos(this.phy);
        var x = r * Math.cos(this.theta);
        var z = r * Math.sin(this.theta);
        var v = new Vector4(x, y, z);
        return v;
    }
}

class Texture3D {
    img: HTMLImageElement;
    loaded: boolean;
    rawData: number[];
    width: number;
    height: number;

    constructor(width: number, height: number, src: string = null) {
        this.height = height;
        this.width = width;
        this.img = new Image(width, height);

        if (src != null) {
            this.img.onload = (ev) => this.onLoadImage(ev);
            this.img.src = src;
        }
        else {
            this.loaded = true;
            this.rawData = new Array();
            for (var j = 0; j < width; j++) {
                for (var i = 0; i < height; i++) {
                    var x = i / 32;
                    var y = j / 32;
                    var offset = 4 * (j * this.width + i)
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
        }
    }

    public pick(u: number, v: number): Vector4 {
        if (this.loaded) {
            var row = Math.round(u * (this.width));
            var col = Math.round(v * (this.height));
            if (row < 0)
                row = 0;
            if (row >= this.width)
                row = this.width-1;
            if (col < 0)
                col = 0;
            if (col >= this.height)
                col = this.height-1;
            var offset = 4 * (row * this.width + col)
            return new Vector4(this.rawData[offset + 0], this.rawData[offset + 1], this.rawData[offset + 2], this.rawData[offset + 3]);
        }
        else {
            return new Vector4(255, 0, 0);
        }
    }
    private onLoadImage(ev) {
        var tmp_canvas = document.createElement("canvas");
        tmp_canvas.width = this.width;
        tmp_canvas.height = this.height;

        var tmp_context = tmp_canvas.getContext('2d');
        tmp_context.drawImage(this.img, 0, 0);

        this.rawData = tmp_context.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height).data;
        this.loaded = true;
    }
}

class Scene3D {
    objectArray: Object3D[] = new Array();
    camera: Camera3D;
    screen: Screen3D;
    
    public setCamera(camera: Camera3D) {
        this.camera = camera;
    }

    public setScreen(screen: Screen3D) {
        this.screen = screen;
    }

    public addObject(obj: Object3D) {
        this.objectArray.push(obj);
    }

    public render(mode: RenderMode) {
        
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
                    var pc0 = pv0.transform(this.camera.view2Clipping);
                    var ps0 = pc0.clip().transform(this.screen.ndc2screen);

                    var pv1 = pm1.position.transform(obj.matrix).transform(this.camera.world2View);
                    var pc1 = pv1.transform(this.camera.view2Clipping);
                    var ps1 = pc1.clip().transform(this.screen.ndc2screen);

                    var pv2 = pm2.position.transform(obj.matrix).transform(this.camera.world2View);
                    var pc2 = pv2.transform(this.camera.view2Clipping);
                    var ps2 = pc2.clip().transform(this.screen.ndc2screen);


                    ps0.w = pc0.w;
                    ps1.w = pc1.w;
                    ps2.w = pc2.w;
                    
                    
                    
                    var normal = pv0.sub(pv1).cross(pv0.sub(pv2));
                    if (pv0.dot(normal) < 0) {
                        this.screen.rasterizer.rasterize(new Vertex3D(ps0, pm0.color, pm0.uv), new Vertex3D(ps1, pm1.color, pm1.uv), new Vertex3D(ps2, pm2.color, pm2.uv));
                    }
                    
                }
            }

        }
        this.screen.commit();
        requestAnimationFrame(() => this.render(mode));
    }

    public start(mode: RenderMode) {

        requestAnimationFrame(() => this.render(mode));

        window.addEventListener("keypress", (e) => this.onKeyDown(e), false)
    }

    public onKeyDown(e) {
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
            console.log("5")
        }

        // D
        if (e.charCode == 'd'.charCodeAt(0)) {
            var m = Matrix44.createRotateY(5 * 3.14 / 180);
            var newDir = this.camera.position.sub(this.camera.target).transform(m);
            var newPosition = this.camera.target.add(newDir);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
            console.log("-5")
        }
    }
}