const height = 1000;
const width = 1000;

let canvas;
let ctx;

window.onload = init;

function init(){
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");


}

class Vector3D {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

class Triangle {
    constructor(a, b, c) {
        this.a = a
        this.b = b
        this.c = c
    }
}

class Mesh {
    constructor() {
        this.triangles = [];
    }

    addTriangles(triangle) {
        this.triangles.push(triangle);
    }

}

class MatriX4x4 {
    constructor() {
        this.arr4x4 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    }
}



function drawTriangle(coordA, coordB, coordC) {

    ctx.beginPath();
    ctx.moveTo(coordA.x, coordA.y);
    ctx.lineTo(coordB.x, coordB.y);
    ctx.lineTo(coordC.x, coordC.y);
    ctx.lineTo(coordA.x, coordA.y);
    ctx.stroke();
    ctx.closePath();
}


let projMatrix = new MatriX4x4();
let fNear = 0.1;
let fFar = 1000.0;
let fFov = 90.0;
let fAspectRatio = height / width;
let fFovRad = 1.0 / (Math.tan(fFov * 0.5 / 180.0 * Math.PI));

projMatrix.arr4x4[0][0] = fAspectRatio * fFovRad;
projMatrix.arr4x4[1][1] = fFovRad;
projMatrix.arr4x4[2][2] = fFar / (fFar - fNear);
projMatrix.arr4x4[3][2] = (-fFar * fNear) / (fFar -fNear);
projMatrix.arr4x4[2][3] = 1.0;

function multiplyMatrixVector(inputMatrix, projMatrix) {
    let projectedMatrix = new Vector3D();

    projectedMatrix.x = inputMatrix.x * projMatrix.arr4x4[0][0] + inputMatrix.y * projMatrix.arr4x4[1][0] + inputMatrix.z * projMatrix.arr4x4[2][0] + projMatrix.arr4x4[3][0];
    projectedMatrix.y = inputMatrix.x * projMatrix.arr4x4[0][1] + inputMatrix.y * projMatrix.arr4x4[1][1] + inputMatrix.z * projMatrix.arr4x4[2][1] + projMatrix.arr4x4[3][1];
    projectedMatrix.z = inputMatrix.x * projMatrix.arr4x4[0][2] + inputMatrix.y * projMatrix.arr4x4[1][2] + inputMatrix.z * projMatrix.arr4x4[2][2] + projMatrix.arr4x4[3][2];
    let w = inputMatrix.x * projMatrix.arr4x4[0][3] + inputMatrix.y * projMatrix.arr4x4[1][3] + inputMatrix.z * projMatrix.arr4x4[2][3] + projMatrix.arr4x4[3][3];

    if (w != 0.0) {
        projectedMatrix.x /= w;
        projectedMatrix.y /= w;
        projectedMatrix.z /= w;
    }

    return projectedMatrix;
}

function render(elapsedTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let cube = new Mesh()

    coordA = new Vector3D(0, 0, 0)
    coordB = new Vector3D(1, 0, 0)
    coordC = new Vector3D(0, 0, 1)
    coordD = new Vector3D(1, 0, 1)
    coordE = new Vector3D(0, 1, 0)
    coordF = new Vector3D(1, 1, 0)
    coordG = new Vector3D(0, 1, 1)
    coordH = new Vector3D(1, 1, 1)


// South
    cube.addTriangles(new Triangle(coordA, coordE, coordF));
    cube.addTriangles(new Triangle(coordA, coordF, coordB));

// East
    cube.addTriangles(new Triangle(coordB, coordF, coordH));
    cube.addTriangles(new Triangle(coordB, coordH, coordD));

// North
    cube.addTriangles(new Triangle(coordD, coordH, coordG));
    cube.addTriangles(new Triangle(coordD, coordG, coordC));

// West
    cube.addTriangles(new Triangle(coordC, coordG, coordE));
    cube.addTriangles(new Triangle(coordC, coordE, coordA));

// Top
    cube.addTriangles(new Triangle(coordE, coordG, coordH));
    cube.addTriangles(new Triangle(coordE, coordH, coordF));

// Bottom
    cube.addTriangles(new Triangle(coordD, coordC, coordA));
    cube.addTriangles(new Triangle(coordD, coordA, coordB));

    let matRotZ = new MatriX4x4()
    let matRotX = new MatriX4x4()
    let fTheta = 0.0
    fTheta += 1.0 * elapsedTime

    // Rotation Z
    matRotZ.arr4x4[0][0] = Math.cos(fTheta)
    matRotZ.arr4x4[0][1] = Math.sin(fTheta)
    matRotZ.arr4x4[1][0] = -Math.sin(fTheta)
    matRotZ.arr4x4[1][1] = Math.cos(fTheta)
    matRotZ.arr4x4[2][2] = 1
    matRotZ.arr4x4[3][3] = 1

    // Rotation X
    matRotX.arr4x4[0][0] = 1
    matRotX.arr4x4[1][1] = Math.cos(fTheta / 2)
    matRotX.arr4x4[1][2] = Math.sin(fTheta / 2)
    matRotX.arr4x4[2][1] = -Math.sin(fTheta / 2)
    matRotX.arr4x4[2][2] = Math.cos(fTheta / 2)
    matRotX.arr4x4[3][3] = 1

    for(let i = 0; i < cube.triangles.length; i++) {
        let triRotatedZ;
        let triRotatedZX;

        // Rotate in Z-Axis
        let projectedAZ = multiplyMatrixVector(cube.triangles[i].a, matRotZ)
        let projectedBZ = multiplyMatrixVector(cube.triangles[i].b, matRotZ)
        let projectedCZ = multiplyMatrixVector(cube.triangles[i].c, matRotZ)

        triRotatedZ = new Triangle(projectedAZ, projectedBZ, projectedCZ)

        // Rotate in X-Axis
        let projectedAZX = multiplyMatrixVector(projectedAZ, matRotX)
        let projectedBZX = multiplyMatrixVector(projectedBZ, matRotX)
        let projectedCZX = multiplyMatrixVector(projectedCZ, matRotX)

        triRotatedZX = new Triangle(projectedAZX, projectedBZX, projectedCZX)

        let triTranslated = triRotatedZX
        let triProjected;

        triTranslated.a.z = triRotatedZX.a.z + 3.0;
        triTranslated.b.z = triRotatedZX.b.z + 3.0;
        triTranslated.c.z = triRotatedZX.c.z + 3.0;

        let projectedA = multiplyMatrixVector(triTranslated.a, projMatrix);
        let projectedB = multiplyMatrixVector(triTranslated.b, projMatrix);
        let projectedC = multiplyMatrixVector(triTranslated.c, projMatrix);

        triProjected = new Triangle(projectedA, projectedB, projectedC)

        triProjected.a.x += 1;
        triProjected.a.y += 1;
        triProjected.b.x += 1;
        triProjected.b.y += 1;
        triProjected.c.x += 1;
        triProjected.c.y += 1;

        triProjected.a.x *= 0.5 * width;
        triProjected.a.y *= 0.5 * height;
        triProjected.b.x *= 0.5 * width;
        triProjected.b.y *= 0.5 * height;
        triProjected.c.x *= 0.5 * width;
        triProjected.c.y *= 0.5 * height;

        console.log(triProjected.a, triProjected.b, triProjected.c)
        //console.log(triTranslated)


        drawTriangle(triProjected.a, triProjected.b, triProjected.c);
    }

}

let lastRenderTime = Date.now();

// Oyun döngüsü
function gameLoop() {
    // Şu anki zamanı al
    let currentTime = Date.now();

    // Geçen süreyi hesapla (milisaniye cinsinden)
    let elapsedTime = currentTime - lastRenderTime;

    // Geçen süreyi saniyeye çevir
    var seconds = elapsedTime / 1000;

    // Çizimi güncelle
    render(seconds);
    
    window.requestAnimationFrame(gameLoop);
}

let drawCube = document.getElementById("makeDraw");
drawCube.addEventListener("click", function () {
    gameLoop()
})





