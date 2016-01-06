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
        return new Vector4(this.x + right.x, this.y + right.y, this.z + right.z);
    }

    public sub(right: Vector4): Vector4 {
        return new Vector4(this.x - right.x, this.y - right.y, this.z - right.z);
    }
    public multi(right: number): Vector4 {
        return new Vector4(this.x * right, this.y * right, this.z * right);
    }
    public cross(right: Vector4): Vector4 {
        return new Vector4(this.y * right.z - this.z * right.y, this.z * right.x - this.x * right.z, this.x * right.y - this.y * right.x);
    }

    public length(): number {
        return Math.sqrt(this.dot(this));
    }
    
    public dot(right:Vector4): number {
        return this.x * right.x + this.y * right.y + this.z * right.z;
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

    public static createRotateY(angle:number):Matrix44 {
        var m = new Matrix44();
        var cos = Math.cos(angle );
        var sin = Math.sin(angle );
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

    constructor(position: Vector4 = new Vector4(), color: Vector4 = new Vector4()) {
        this.position = position;
        this.color = color;
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

class Screen3D {
    ndc2screen: Matrix44;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
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

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    round(n:number) : number {
        if (n - Math.floor(n) > 0.5)
            n = Math.floor(n) + 1;
        else 
            n = Math.floor(n);
        return n;
    }

    /**
     * Given three points with:
    * - position in screen space
    * - color same as original
    * Draw the triangle 
    */
    rasterize(p1: Vertex3D, p2: Vertex3D, p3: Vertex3D) {

        this.ctx.fillStyle = "rgb(255,255,255)";
        this.ctx.fillRect(p1.x, p1.y, 2, 2);
        this.ctx.fillRect(p2.x, p2.y, 2, 2);
        this.ctx.fillRect(p3.x, p3.y, 2, 2);

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
        
        for (var y = roundAy; y < roundBy; y++) {

            var t1 = (y - pa.y) / (pb.y - pa.y);
            var t2 = (y - pa.y) / (pc.y - pa.y);
            
            if (t1 < 0)
                t1 = 0;
            if (t2 < 0)
                t2 = 0;
            /**
             * 不取整会导致波纹效果
             */
            var sx = pa.x + t1 * (pb.x - pa.x);
            var ex = pa.x + t2 * (pc.x - pa.x);


            var csByZs = pa.color.multi((1 - t1) / pa.w).add(pb.color.multi(t1 / pb.w));
            var ceByZe = pa.color.multi((1 - t2) / pa.w).add(pc.color.multi(t2 / pc.w));
            var recipZs = (1 - t1) / pa.w + t1 / pb.w;
            var recipZe = (1 - t2) / pa.w + t2 / pc.w;
            if (gradientAC < gradientAB) {
                sx = [ex, ex = sx][0];
                csByZs = [ceByZe, ceByZe = csByZs][0];
                recipZs = [recipZe, recipZe = recipZs][0];
            }
            
            
            var roundsx = Math.round(sx);
            var roundex = Math.round(ex);
                          
            var diffX = ex - sx;


            for (var x = roundsx; x < roundex; x++) {
                var t3 = (x - sx) / diffX;

                var recipZm = (1 - t3) * recipZs + t3 * recipZe;
                var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
                var cm = cmByzm.multi(1 / recipZm);
                    
                /**
                 * rgb里必须是整数
                 */
                this.ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
                this.ctx.fillRect(x, y, 1, 1);

            }

        }
        
        

        
        for (var y = roundBy; y < roundCy; y++) {

            var t1 = (y - pb.y) / (pc.y - pb.y);
            var t2 = (y - pa.y) / (pc.y - pa.y);
            
            if (t1 < 0)
                t1 = 0;
            if (t2 < 0)
                t2 = 0;
                
            var sx = pb.x + t1 * (pc.x - pb.x);
            var ex = pa.x + t2 * (pc.x - pa.x);


            var csByZs = pc.color.multi((t1) / pc.w).add(pb.color.multi((1-t1) / pb.w));
            var ceByZe = pc.color.multi((t2) / pc.w).add(pa.color.multi((1-t2) / pa.w));
            var recipZs = (t1) / pc.w + (1-t1) / pb.w;
            var recipZe = (t2) / pc.w + (1-t2) / pa.w;
            
            /**
             * 三角形的下半部分，左边的边gradient更大
             */
            if (gradientBC < gradientAC) {
                sx = [ex, ex = sx][0];
                csByZs = [ceByZe, ceByZe = csByZs][0];
                recipZs = [recipZe, recipZe = recipZs][0];
            }

           var roundsx = Math.round(sx);
           var roundex = Math.round(ex);
                
            var diffX = ex - sx;

            for (var x = roundsx; x < roundex; x++) {
                var t3 = (x - sx) / diffX;

                var recipZm = (1 - t3) * recipZs + t3 * recipZe;
                var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
                var cm = cmByzm.multi(1 / recipZm);
                    
                /**
                 * rgb里必须是整数
                 */
                this.ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
                this.ctx.fillRect(x, y, 1, 1);

            }

        }
    }
}



class Object3D {
    constructor(geometry: Geometry3D) {
        this.geometry = geometry;
        this.matrix = new Matrix44();
    }
    geometry: Geometry3D;
    matrix: Matrix44;
}

interface Geometry3D {
    vertexArray: Vertex3D[];
    indexArray: number[];
}

class CubeGeometry implements Geometry3D {
    vertexArray: Vertex3D[] = new Array();
    indexArray: number[] = new Array();

    constructor() {
        this.vertexArray.push(new Vertex3D(new Vector4(-1, 1, 1), new Vector4(255, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, 1, 1), new Vector4(0, 255, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(-1, -1, 1), new Vector4(0, 0, 255)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, -1, 1), new Vector4(255, 255, 255)));

        this.vertexArray.push(new Vertex3D(new Vector4(-1, 1, -1), new Vector4(255, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, 1, -1), new Vector4(255, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(-1, -1, -1), new Vector4(255, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, -1, -1), new Vector4(255, 0, 0)));
        
        // 前
        this.indexArray.push(0, 2, 3);
        this.indexArray.push(0, 3, 1);
        
        // 右
        this.indexArray.push(1, 3, 7);
        this.indexArray.push(1, 7, 5);
        
        // 后
        this.indexArray.push(5, 7, 6);
        this.indexArray.push(5, 6, 4);
        
        // 左
        this.indexArray.push(4, 6, 2);
        this.indexArray.push(4, 2, 0);
        
        // 上
        this.indexArray.push(4, 0, 1);
        this.indexArray.push(4, 1, 5);
        
        // 下
        this.indexArray.push(3, 2, 6);
        this.indexArray.push(3, 6, 7);
    }
}


/*
 * Y is up
 */

class SphericalCoodinate {
    theta:number; // in radius
    length:number;
    phy:number;
    
    fromCartesian(v:Vector4) {
        this.length = v.length();
        this.theta = Math.atan2(v.z, v.x);
        this.phy = Math.atan2(Math.sqrt(v.x * v.x + v.z * v.z), v.y);
    }
    
    toCartesian(): Vector4 {
        var r = this.length * Math.sin(this.phy);
        var y =  this.length * Math.cos(this.phy);
        var x = r * Math.cos(this.theta);
        var z = r * Math.sin(this.theta);
        var v = new Vector4(x, y, z);
        return v;
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

    public render() {
        this.screen.clear();
        for (var o = 0; o < this.objectArray.length; o++) {
            var obj = this.objectArray[o];
            var triangleNum = obj.geometry.indexArray.length / 3;
            for (var i = 0; i < triangleNum; i++) {
                var i0 = obj.geometry.indexArray[i * 3 + 0];
                var i1 = obj.geometry.indexArray[i * 3 + 1];
                var i2 = obj.geometry.indexArray[i * 3 + 2];
                var pm0 = obj.geometry.vertexArray[i0];
                var pm1 = obj.geometry.vertexArray[i1];
                var pm2 = obj.geometry.vertexArray[i2];

                var pv0 = pm0.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc0 = pv0.transform(this.camera.view2Clipping);
                var ps0 = pc0.clip().transform(this.screen.ndc2screen);

                var pv1 = pm1.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc1 = pv1.transform(this.camera.view2Clipping);
                var ps1 = pc1.clip().transform(this.screen.ndc2screen);

                var pv2 = pm2.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc2 = pv2.transform(this.camera.view2Clipping);
                var ps2 = pc2.clip().transform(this.screen.ndc2screen);

                
                ps0.w = pv0.w;
                ps1.w = pv1.w;
                ps2.w = pv2.w;

                var normal = pv0.sub(pv1).cross(pv0.sub(pv2));
                if (pv0.dot(normal) < 0) {
                    this.screen.rasterize(new Vertex3D(ps0, pm0.color), new Vertex3D(ps1, pm1.color), new Vertex3D(ps2, pm2.color));
                }

            }

        }
        
        requestAnimationFrame(() => this.render());
    }

    public start() {

        requestAnimationFrame(() => this.render());

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
            var m = Matrix44.createRotateY(-5 * 3.14 / 180 );
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