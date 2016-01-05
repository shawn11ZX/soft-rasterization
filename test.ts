

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
    screen.rasterize(v1, v2, v3);

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
    
    screen.rasterize(v1, v2, v3);
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
    
    screen.rasterize(v1, v2, v3);
}


function testPerspective() {

    var p1 = new Vector4(0, 30, -50);
    var p2 = new Vector4(-30, -30, -50);
    var p3 = new Vector4(30, -30, -50);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera3D(90, 5 / 4, 0.01, 1000);

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



    screen.rasterize(v1, v2, v3);
}

function testLookAt() {

    var p1 = new Vector4(0, 30, 0);
    var p2 = new Vector4(-30, 0, 0);
    var p3 = new Vector4(0, -30, 0);

    var screen = new Screen3D(1024, 768);
    var camera = new Camera3D(90, 5 / 4, 0.01, 1000);
    
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



    screen.rasterize(v1, v2, v3);
}


function main() {
   
    var screen = new Screen3D(1027, 768);
    var camera = new Camera3D(90, 5/4, 0.01, 100000);
    camera.lookAt(new Vector4(0, 0, 50), new Vector4(0, 0, 0), new Vector4(0, 1, 0, 0));
    
    var scene = new Scene3D();
    var obj = new Object3D(new CubeGeometry());
    scene.addObject(obj);
    scene.setCamera(camera);
    scene.setScreen(screen);
    
    scene.render();
}

//testRasterize();
// testScreen3d();
//testLookAt();
//testPerspective();
main();