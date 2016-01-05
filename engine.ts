

function init() {
    var canv = document.createElement("canvas");
    canv.width = 1024;
    canv.height = 768;
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);
    testrasterize(ctx);
}

function testrasterize(ctx:CanvasRenderingContext2D) {
    var p1 = new Vertex();
    p1.position = new Float3D(300, 0, 0);
    p1.color = new Float3D(255, 0, 0);

    var p2 = new Vertex();
    p2.position = new Float3D(100, 300, 0);
    p2.color = new Float3D(0, 255, 0);

    var p3 = new Vertex();
    p3.position = new Float3D(400, 600, 0);
    p3.color = new Float3D(0, 0, 255);


    rasterize(p1, p2, p3, ctx);

    var transRight = new Float3D(400, 0, 0);

    var p22 = new Vertex();
    p22.position = new Float3D(900, 300, 0);
    p22.color = new Float3D(0, 255, 0);
    
    p1.position = p1.position.add(transRight);
    
    p3.position = p3.position.add(transRight);
    rasterize(p1, p22, p3, ctx);
}

class Float3D {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x1: number, y1: number, z1: number) {
        this.x = x1;
        this.y = y1;
        this.z = z1;
        this.w = 1;
    }

    public add(right: Float3D): Float3D {
        return new Float3D(this.x + right.x, this.y + right.y, this.z + right.z);
    }

    public multi(right: number): Float3D {
        return new Float3D(this.x * right, this.y * right, this.z * right);
    }
}

class Matrix4 {
    x:Float3D;
    y:Float3D;
    z:Float3D;
    w:Float3D;
}

class Vertex {
    position: Float3D;
    color: Float3D;

    get x(): number { return this.position.x; }
    get y(): number { return this.position.y; }
    get z(): number { return this.position.z; }
    get w(): number { return this.position.w; }
}

/**
 * Given three points with:
 * - position in screen space
 * - color same as original
 * Draw the triangle 
 */
function rasterize(p1: Vertex, p2: Vertex, p3: Vertex, ctx: CanvasRenderingContext2D) {
    
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(p1.x, p1.y, 2, 2);
    ctx.fillRect(p2.x, p2.y, 2, 2);
    ctx.fillRect(p3.x, p3.y, 2, 2);
            
    var vertexArray: Array<Vertex> = [p1, p2, p3];
    vertexArray.sort((a, b) => a.position.y - b.position.y);
    var pa = vertexArray[0];
    var pb = vertexArray[1];
    var pc = vertexArray[2];

    var diffY = pb.y - pa.y;
    /**
     * Y/X会导致不统一，换成X/Y
     */
    var gradientBC = (pc.x - pb.x) / (pc.y - pb.y);
    var gradientAB = (pb.x - pa.x) / (pb.y - pa.y) ;
    var gradientAC = (pc.x - pa.x) / (pc.y - pa.y) ;
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
            if (gradientAC < gradientAB) {
                t3 = 1 - t3;
            }
            var recipZm = (1 - t3) * recipZs + t3 * recipZe;
            var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
            var cm = cmByzm.multi(1 / recipZm);
                
            /**
             * rgb里必须是整数
             */
            ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
            ctx.fillRect(x + sx, y + pa.y, 1, 1);
            
        }

    }
    
    diffY = pc.y - pb.y;
    for (var y = 0; y < diffY; y++) {

        
        var t1 = (diffY-y) / (pc.y - pb.y);
        var t2 = (diffY-y) / (pc.y - pa.y);

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
            if (gradientBC < gradientAC) {
                t3 = 1 - t3;
            }
            var recipZm = (1 - t3) * recipZs + t3 * recipZe;
            var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
            var cm = cmByzm.multi(1 / recipZm);
                
            /**
             * rgb里必须是整数
             */
            ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
            ctx.fillRect(x + sx, y + pb.y, 1, 1);
            
        }

    }
}


init();