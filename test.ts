

function testRasterize() {
    
    var p1 = new Vector4(300, 0, 0);
    var p2 = new Vector4(100, 300, 0);
    var p3 = new Vector4(400, 600, 0);
  
    var v1 = new Vertex3D(
        p1,
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex3D(
        p2,
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex3D(
        p3,
        new Vector4(0, 0, 255)
    );

    var screen = new Screen3D(1024, 768);
    screen.rasterize(v1, v2, v3, RenderMode.Color);

    var transRight = new Vector4(400, 0, 0);

    v1 = new Vertex3D(
        p1.add(transRight),
        new Vector4(255, 0, 0)
    );
    
    v2 = new Vertex3D(
        p2.add(transRight),
        new Vector4(0, 255, 0)
    );
    
    v3 = new Vertex3D(
        p3.add(transRight),
        new Vector4(0, 0, 255)
    );
    
    screen.rasterize(v1, v2, v3, RenderMode.Color);
}

function testScreen3d() {
    
    var p1 = new Vector4(0, 1, 0);
    var p2 = new Vector4(-1, 0, 0);
    var p3 = new Vector4(0, -1, 0);
  
  var screen = new Screen3D(1024, 768);
  
    var v1 = new Vertex3D(
        p1.transform(screen.ndc2screen),
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex3D(
        p2.transform(screen.ndc2screen),
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex3D(
        p3.transform(screen.ndc2screen),
        new Vector4(0, 0, 255)
    );
    
    screen.rasterize(v1, v2, v3, RenderMode.Color);
}


function testPerspective() {

    var p1 = new Vector4(0, 30, -50);
    var p2 = new Vector4(-30, -30, -50);
    var p3 = new Vector4(30, -30, -50);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera3D(screen, 90 * 3.14 / 180 , 5 / 4, 0.01, 1000);

    var v1 = new Vertex3D(
        p1.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex3D(
        p2.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex3D(
        p3.transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 0, 255)
    );



    screen.rasterize(v1, v2, v3, RenderMode.Color);
}

function testLookAt() {

    var p1 = new Vector4(0, 30, 0);
    var p2 = new Vector4(-30, 0, 0);
    var p3 = new Vector4(0, -30, 0);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera3D(screen, 90 * 3.14 / 180, 5 / 4, 0.01, 1000);
    
    camera.lookAt(new Vector4(0, 0, -100), new Vector4(0, 0, 0), new Vector4(0, 1, 0, 0))
    
    var v1 = new Vertex3D(
        p1.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(255, 0, 0)
    );

    var v2 = new Vertex3D(
        p2.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 255, 0)
    );

    var v3 = new Vertex3D(
        p3.transform(camera.world2View).transform(camera.view2Clipping).clip().transform(screen.ndc2screen),
        new Vector4(0, 0, 255)
    );



    screen.rasterize(v1, v2, v3, RenderMode.Color);
}

function testPerspective2()
{
    
    
    
    var screen = new Screen3D(1024/2, 768/2);
    var camera = new Camera3D(screen, 90* 3.14 / 180, 5 / 4, 10, 1000);
    console.log(camera.view2Clipping);
    
    var p2 = new Vector4(0, 0, -500);
    var p2p = new Vector4(0, 0, -500);
    
    p2 = new Vector4(0, 0, -0.01);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
    
    p2 = new Vector4(0, 0, -10);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
     p2 = new Vector4(0, 0, -20);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
    p2 = new Vector4(0, 0, -50);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
    p2 = new Vector4(0, 0, -300);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
    p2 = new Vector4(0, 0, -500);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
    p2 = new Vector4(0, 0, -900);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
    
        p2 = new Vector4(0, 0, -1000);
    p2p = p2.transform(camera.view2Clipping);
    console.log("========")
    console.log(p2);
    console.log(p2p);
    console.log(p2p.clip());
}

function main() {
   
    var screen = new Screen3D(1024, 768);
    var camera = new Camera3D(screen, 90* 3.14 / 180, 5/4, 1, 100);
    camera.lookAt(new Vector4(0, 0, 50), new Vector4(0, 0, 0), new Vector4(0, 1, 0, 0));
    
    var scene = new Scene3D();
    
    
    
    
    var texture = new Texture3D(256, 256);
    
    var cube = new Cube3D();
    cube.matrix.scale(20, 10, 10);
    
    scene.addObject(cube);
    scene.setCamera(camera);
    scene.setScreen(screen);
    
    
    
    scene.start(RenderMode.Texture);
}

//testRasterize();
// testScreen3d();
//testLookAt();
//testPerspective();
//testPerspective2();
main();