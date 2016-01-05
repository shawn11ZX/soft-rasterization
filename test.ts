
function testRasterize(ctx: CanvasRenderingContext2D) {
    var p1 = new Vertex();
    p1.position = new Vector4(300, 0, 0);
    p1.color = new Vector4(255, 0, 0);

    var p2 = new Vertex();
    p2.position = new Vector4(100, 300, 0);
    p2.color = new Vector4(0, 255, 0);

    var p3 = new Vertex();
    p3.position = new Vector4(400, 600, 0);
    p3.color = new Vector4(0, 0, 255);


    rasterize(p1, p2, p3, ctx);

    var transRight = new Vector4(400, 0, 0);

    var p22 = new Vertex();
    p22.position = new Vector4(900, 300, 0);
    p22.color = new Vector4(0, 255, 0);

    p1.position = p1.position.add(transRight);

    p3.position = p3.position.add(transRight);
    rasterize(p1, p22, p3, ctx);
}

function testScreen3d(ctx: CanvasRenderingContext2D) {
    var p1 = new Vertex();
    p1.position = new Vector4(0, 1, 0);
    p1.color = new Vector4(255, 0, 0);

    var p2 = new Vertex();
    p2.position = new Vector4(-1, 0, 0);
    p2.color = new Vector4(0, 255, 0);

    var p3 = new Vertex();
    p3.position = new Vector4(0, -1, 0);
    p3.color = new Vector4(0, 0, 255);

    var screen = new Screen3D(1024, 768);
    rasterize(p1.transform(screen.ndc2screen), p2.transform(screen.ndc2screen), p3.transform(screen.ndc2screen), ctx);
}


function testPerspective(ctx: CanvasRenderingContext2D) {

    var p1 = new Vector4(0, 30, -50);
    var p2 = new Vector4(-30, -30, -50);
    var p3 = new Vector4(30, -30, -50);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera(90, 5 / 4, 0.01, 1000);

    var v1 = new Vertex(
        p1.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex(
        p2.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex(
        p3.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 0, 255)
    );



    rasterize(v1, v2, v3, ctx);
}

function testLookAt(ctx: CanvasRenderingContext2D) {

    var p1 = new Vector4(0, 30, 0);
    var p2 = new Vector4(-30, 0, 0);
    var p3 = new Vector4(0, -30, 0);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera(90, 5 / 4, 0.01, 1000);
    
    camera.lookAt(new Vector4(0, 0, -100), new Vector4(0, 0, 0), new Vector4(0, 1, 0, 0))
    
    var v1 = new Vertex(
        p1.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex(
        p2.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex(
        p3.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 0, 255)
    );



    rasterize(v1, v2, v3, ctx);
}