
const height = 1000.0;
const width = 1000.0;

let canvas;
let ctx;

window.onload = init;

function init(){
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // Start the first frame request
    // window.requestAnimationFrame(gameLoop);
}
class mat4x4 {
    constructor() {
        this.mat = [
            [0., 0., 0., 0.],
            [0., 0., 0., 0.],
            [0., 0., 0., 0.],
            [0., 0., 0., 0.]
        ];
    }

    getMatrix() {
        return this.mat;
    }
}

class Coord {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Triangle {
    constructor(coordA, coordB, coordC) {
        this.a = coordA;
        this.b = coordB;
        this.c = coordC;
    }

    get getA() {
        return this.a;
    }

    get getB() {
        return this.b;
    }

    get getC() {
        return this.c;
    }
}

class Mesh {
    constructor() {
        this.triangles = [];
    }

    setTriangle(triangle) {
        this.triangles.push(triangle);
    }

}

function drawTriangle(coordA, coordB, coordC, dp) {

    let lumen = 'rgb(' + (dp*256) +','+ (dp*256) +','+ (dp*256) + ')'

    ctx.strokeStyle = lumen
    ctx.fillStyle = lumen
    ctx.beginPath();
    ctx.moveTo(coordA.x, coordA.y);
    ctx.lineTo(coordB.x, coordB.y);
    ctx.lineTo(coordC.x, coordC.y);
    ctx.lineTo(coordA.x, coordA.y);
    ctx.fill()
    ctx.stroke();
    ctx.closePath();
}


function loadFromObjFile(objText) {
    let mesh = new Mesh();

    let lines = objText.split("\n");
    //console.log(lines)
    let vertexIndices = [];

    for (let count = 0; count < lines.length; count++) {
        let words = lines[count].split(" ");

        if (words[0] === "v") {
            let x = parseFloat(words[1]);
            let y = parseFloat(words[2]);
            let z = parseFloat(words[3]);
            mesh.setTriangle(new Coord(x, y, z));

        } else if (words[0] === "f") {
            vertexIndices.push(parseInt(words[1].split("/")[0]) - 1);
            vertexIndices.push(parseInt(words[2].split("/")[0]) - 1);
            vertexIndices.push(parseInt(words[3].split("/")[0]) - 1);

            if (vertexIndices.length === 9) {
                let tri1 = new Triangle(
                    mesh.triangles.a = [vertexIndices[0]],
                    mesh.triangles.b = [vertexIndices[1]],
                    mesh.triangles.c = [vertexIndices[2]]
                );
                let tri2 = new Triangle(
                    mesh.triangles.a = [vertexIndices[3]],
                    mesh.triangles.b = [vertexIndices[4]],
                    mesh.triangles.c = [vertexIndices[5]]
                );
                let tri3 = new Triangle(
                    mesh.triangles.a = [vertexIndices[6]],
                    mesh.triangles.b = [vertexIndices[7]],
                    mesh.triangles.c = [vertexIndices[8]]
                );
                mesh.setTriangle(tri1);
                mesh.setTriangle(tri2);
                mesh.setTriangle(tri3);
                vertexIndices = [];
            }
        }
    }
    console.log(mesh.triangles)
    gameLoop(mesh)
}

/*
let drawBtn = document.querySelector("#btnDrawTriangle");
drawBtn.addEventListener("click", function () {
    let coordA = [0, 0];
    let coordB = [0, 100];
    let coordC = [200, 100];

    drawTriangle(coordA, coordB, coordC);
    //readFile(fileName)


});
 */





let fileName = "VideoShip.obj"; // Or user-selected file

function readFile(filePath) {
    let objText = ""
    let newObj = new Mesh()

    if (typeof filePath === 'string') { // Check if string path
        fetch(filePath) // Fetch file contents
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function() {
                    const text = reader.result;
                    //console.log(text);
                    objText += text
                    loadFromObjFile(objText)

                    //console.log(objText);

                };
                reader.readAsText(blob);

            })
            .catch(error => console.error("Error fetching file:", error));
    } else if (filePath instanceof Blob) { // Check if Blob object
        const reader = new FileReader();
        reader.onload = function() {
            const text = reader.result;

        };
        reader.readAsText(filePath);
    } else {
        console.error("Invalid file path or Blob object:", filePath);
    }
}






function MultiplyMatrixVector(inputMatrix, projMatrix) {
    let projectedMatrix = new Coord();

    projectedMatrix.x = inputMatrix.x * projMatrix.getMatrix()[0][0] + inputMatrix.y * projMatrix.getMatrix()[1][0] + inputMatrix.z * projMatrix.getMatrix()[2][0] + projMatrix.getMatrix()[3][0];
    projectedMatrix.y = inputMatrix.x * projMatrix.getMatrix()[0][1] + inputMatrix.y * projMatrix.getMatrix()[1][1] + inputMatrix.z * projMatrix.getMatrix()[2][1] + projMatrix.getMatrix()[3][1];
    projectedMatrix.z = inputMatrix.x * projMatrix.getMatrix()[0][2] + inputMatrix.y * projMatrix.getMatrix()[1][2] + inputMatrix.z * projMatrix.getMatrix()[2][2] + projMatrix.getMatrix()[3][2];
    let w = inputMatrix.x * projMatrix.getMatrix()[0][3] + inputMatrix.y * projMatrix.getMatrix()[1][3] + inputMatrix.z * projMatrix.getMatrix()[2][3] + projMatrix.getMatrix()[3][3];

    if (w != 0.0) {
        projectedMatrix.x /= w;
        projectedMatrix.y /= w;
        projectedMatrix.z /= w;
    }

    return projectedMatrix;
}


let projMatrix = new mat4x4();
let fNear = 0.1;
let fFar = 1000.0;
let fFov = 90.0;
let fAspectRatio = height / width;
let fFovRad = 1.0 / (Math.tan(fFov * 0.5 / 180.0 * 3.14159));

projMatrix.getMatrix()[0][0] = fAspectRatio * fFovRad;
projMatrix.getMatrix()[1][1] = fFovRad;
projMatrix.getMatrix()[2][2] = fFar / (fFar - fNear);
projMatrix.getMatrix()[3][2] = (-fFar * fNear) / (fFar -fNear);
projMatrix.getMatrix()[2][3] = 1.0;

let cube = new Mesh();

// South
cube.setTriangle(new Triangle(new Coord(0., 0., 0.), new Coord(0., 1., 0.), new Coord(1., 1., 0.)));
cube.setTriangle(new Triangle(new Coord(0., 0., 0.), new Coord(1., 1., 0.), new Coord(1., 0., 0.)));

// East
cube.setTriangle(new Triangle(new Coord(1., 0., 0.), new Coord(1., 1., 0.), new Coord(1., 1., 1.)));
cube.setTriangle(new Triangle(new Coord(1., 0., 0.), new Coord(1., 1., 1.), new Coord(1., 0., 1.)));

// North
cube.setTriangle(new Triangle(new Coord(1., 0., 1.), new Coord(1., 1., 1.), new Coord(0., 1., 1.)));
cube.setTriangle(new Triangle(new Coord(1., 0., 1.), new Coord(0., 1., 1.), new Coord(0., 0., 1.)));

// West
cube.setTriangle(new Triangle(new Coord(0., 0., 1.), new Coord(0., 1., 1.), new Coord(0., 1., 0.)));
cube.setTriangle(new Triangle(new Coord(0., 0., 1.), new Coord(0., 1., 0.), new Coord(0., 0., 0.)));

// Top
cube.setTriangle(new Triangle(new Coord(0., 1., 0.), new Coord(0., 1., 1.), new Coord(1., 1., 1.)));
cube.setTriangle(new Triangle(new Coord(0., 1., 0.), new Coord(1., 1., 1.), new Coord(1., 1., 0.)));

// Bottom
cube.setTriangle(new Triangle(new Coord(1., 0., 1.), new Coord(0., 0., 1.), new Coord(0., 0., 0.)));
cube.setTriangle(new Triangle(new Coord(1., 0., 1.), new Coord(0., 0., 0.), new Coord(1., 0., 0.)));


let fTheta = 0.0;
let vCamera = new Coord(0., 0., 0.)
let lightDirection = new Coord(0,0,-1)
function render(elapsedTime, cube) {


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let matRotZ = new mat4x4();
    let matRotX = new mat4x4();
    fTheta += 1.0 * elapsedTime;

    matRotZ.getMatrix()[0][0] = Math.cos(fTheta);
    matRotZ.getMatrix()[0][1] = Math.sin(fTheta);
    matRotZ.getMatrix()[1][0] = -Math.sin(fTheta);
    matRotZ.getMatrix()[1][1] = Math.cos(fTheta);
    matRotZ.getMatrix()[2][2] = 1;
    matRotZ.getMatrix()[3][3] = 1;

    matRotX.getMatrix()[0][0] = 1;
    matRotX.getMatrix()[1][1] = Math.cos(fTheta * 0.5);
    matRotX.getMatrix()[1][2] = Math.sin(fTheta * 0.5);
    matRotX.getMatrix()[2][1] = -Math.sin(fTheta * 0.5);
    matRotX.getMatrix()[2][2] = Math.cos(fTheta * 0.5);
    matRotX.getMatrix()[3][3] = 1;

    for (let i = 0; i < 12; ++i) {
        //console.log(nef)
        let translatedTriangle = cube[i]

        let currA = MultiplyMatrixVector(translatedTriangle.a, matRotZ);
        let currB = MultiplyMatrixVector(translatedTriangle.b, matRotZ);
        let currC = MultiplyMatrixVector(translatedTriangle.c, matRotZ);

        let rotatedA = MultiplyMatrixVector(currA, matRotX);
        let rotatedB = MultiplyMatrixVector(currB, matRotX);
        let rotatedC = MultiplyMatrixVector(currC, matRotX);

        translatedTriangle = new Triangle(rotatedA, rotatedB, rotatedC);

        translatedTriangle.a.z += 8.0;
        translatedTriangle.b.z += 8.0;
        translatedTriangle.c.z += 8.0;

        let normal= new Coord()
        let line1 = new Coord()
        let line2 = new Coord()

        line1.x = translatedTriangle.b.x - translatedTriangle.a.x
        line1.y = translatedTriangle.b.y - translatedTriangle.a.y
        line1.z = translatedTriangle.b.z - translatedTriangle.a.z

        line2.x = translatedTriangle.c.x - translatedTriangle.a.x
        line2.y = translatedTriangle.c.y - translatedTriangle.a.y
        line2.z = translatedTriangle.c.z - translatedTriangle.a.z

        normal.x = line1.y * line2.z - line1.z * line2.y
        normal.y = line1.z * line2.x - line1.x * line2.z
        normal.z = line1.x * line2.y - line1.y * line2.x

        let lengthOfNormal = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
        normal.x /= lengthOfNormal
        normal.y /= lengthOfNormal
        normal.z /= lengthOfNormal


        if (normal.x * (translatedTriangle.a.x - vCamera.x) +
            normal.y * (translatedTriangle.a.y - vCamera.y) +
            normal.z * (translatedTriangle.a.z - vCamera.z) < 0.0) {

            let lengthOfLight = Math.sqrt(lightDirection.x**2 + lightDirection.y**2 + lightDirection.z**2)
            lightDirection.x /= lengthOfLight
            lightDirection.y /= lengthOfLight
            lightDirection.z /= lengthOfLight

            let dp = normal.x * lightDirection.x + normal.y * lightDirection.y + normal.z * lightDirection.z



            let projectedA = MultiplyMatrixVector(translatedTriangle.a, projMatrix);
            let projectedB = MultiplyMatrixVector(translatedTriangle.b, projMatrix);
            let projectedC = MultiplyMatrixVector(translatedTriangle.c, projMatrix);

            let projectedTriangle = new Triangle(projectedA, projectedB, projectedC);

            projectedTriangle.a.x += 1.0; projectedTriangle.a.y += 1.0;
            projectedTriangle.b.x += 1.0; projectedTriangle.b.y += 1.0;
            projectedTriangle.c.x += 1.0; projectedTriangle.c.y += 1.0;

            projectedTriangle.a.x *= 0.5 * width;
            projectedTriangle.a.y *= 0.5 * height;
            projectedTriangle.b.x *= 0.5 * width;
            projectedTriangle.b.y *= 0.5 * height;
            projectedTriangle.c.x *= 0.5 * width;
            projectedTriangle.c.y *= 0.5 * height;


            console.log(projectedTriangle.a);
            console.log(projectedTriangle.b);
            console.log(projectedTriangle.c);

            drawTriangle(projectedTriangle.a, projectedTriangle.b, projectedTriangle.c, dp);
        }

    }

}

// Render fonksiyonu

// Başlangıç zamanını ve son zamanı tanımla
let startTime = Date.now();

// Oyun döngüsü
function gameLoop(meshOb) {
    //console.log(meshOb.triangles)
    let lastRenderTime = Date.now();

    // Şu anki zamanı al
    let currentTime = Date.now();

    // Geçen süreyi hesapla (milisaniye cinsinden)
    let elapsedTime = currentTime - lastRenderTime;

    // Geçen süreyi saniyeye çevir
    var seconds = elapsedTime / 1000;

    // Çizimi güncelle
    render(seconds, meshOb);

    // Son render zamanını güncelle
    lastRenderTime = currentTime;
    window.requestAnimationFrame(gameLoop);
}

let btnCub = document.getElementById("btnDrawSquare");
btnCub.addEventListener("click", function () {
    gameLoop(cube)
})

let btnCube = document.getElementById("btnCube");
btnCube.addEventListener("click", function() {

    readFile(fileName);
});
