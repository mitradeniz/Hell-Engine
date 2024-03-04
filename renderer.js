let a = ""
console.log(a)

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



function drawTriangle(coordA, coordB, coordC, dp) {
    let lumen = 'rgb(' + (dp*256 - 40) +','+ (dp*256 + 40 ) +','+ (dp*256 + 40) + ')'

    //ctx.strokeStyle = lumen
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

    let vertices = []; // Array to store processed vertices
    let vertexIndices = []; // Array to store indices for triangle faces

    for (let line of lines) {
        let words = line.split(" ");

        if (words[0] === "v") {
            let x = parseFloat(words[1]);
            let y = parseFloat(words[2]);
            let z = parseFloat(words[3]);

            // Create a new Vector3D object and add it to the vertices array
            vertices.push(new Vector3D(x, y, z));
        } else if (words[0] === "f") {
            // Extract vertex indices, considering potential offset and slash notation
            let v1 = parseInt(words[1].split("/")[0]) - 1;
            let v2 = parseInt(words[2].split("/")[0]) - 1;
            let v3 = parseInt(words[3].split("/")[0]) - 1;

            // Add indices to the vertexIndices array
            vertexIndices.push(v1);
            vertexIndices.push(v2);
            vertexIndices.push(v3);

            // Create triangle objects and add them to the mesh (assuming Mesh has addTriangles method)
            mesh.addTriangles(
                new Triangle(vertices[v1], vertices[v2], vertices[v3])
            );
        }
    }
    //console.log(mesh); // Log the processed mesh to the console
    return mesh // Call the game loop function with the processed mesh
}


//console.log("ASDASF" , loadFromObjFile(a))

let fileName = "VideoShip.obj";
/*
// Değişkeni Promise dışında tanımlayın
const myPromise = new Promise(async (resolve, reject) => {
    try {
        // Assuming readFile returns the OBJ text content as a string
        const objText = await a;

        // Call loadFromObjFile to process the OBJ text and create the mesh
        const mesh = await loadFromObjFile(objText);

        // Resolve the promise with the created mesh
        resolve(mesh);

    } catch (error) {
        // Reject the promise with an informative error message
        reject(`Error loading OBJ file: ${error.message}`);
    }
});


myPromise
    .then(shipObj => {
        console.log("access");
        obj = shipObj// Successfully processed mesh
    })
    .catch(error => {
        console.log("error"); // Handle errors gracefully
    });


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

                    console.log(objText);

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
    console.log(objText);

}

 */



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

let vCamera = new Vector3D(0, 0, 0)
let lightDirection = new Vector3D(0, 0, -1)


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
    let cube = loadFromObjFile(a)
    console.log(cube)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
/*
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

 */

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

    //console.log(cube.triangles)

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

        // Offset into the screen
        triRotatedZX = new Triangle(projectedAZX, projectedBZX, projectedCZX)

        let triTranslated = triRotatedZX
        let triProjected;

        triTranslated.a.z = triRotatedZX.a.z + 3.15;
        triTranslated.b.z = triRotatedZX.b.z + 3.15;
        triTranslated.c.z = triRotatedZX.c.z + 3.15;

        let normal = new Vector3D()
        let line1 = new Vector3D()
        let line2 = new Vector3D()

        line1.x = triTranslated.b.x - triTranslated.a.x
        line1.y = triTranslated.b.y - triTranslated.a.y
        line1.z = triTranslated.b.z - triTranslated.a.z

        line2.x = triTranslated.c.x - triTranslated.a.x
        line2.y = triTranslated.c.y - triTranslated.a.y
        line2.z = triTranslated.c.z - triTranslated.a.z

        normal.x = line1.y * line2.z - line1.z * line2.y
        normal.y = line1.z * line2.x - line1.x * line2.z
        normal.z = line1.x * line2.y - line1.y * line2.x

        let l = Math.sqrt(normal.x**2 + normal.y**2 + normal.z**2)
        normal.x /= l
        normal.y /= l
        normal.z /= l

        //if (normal.z < 0)
        if (normal.x * (triTranslated.a.x - vCamera.x) +
            normal.y * (triTranslated.a.y - vCamera.y) +
            normal.z * (triTranslated.a.z - vCamera.z) < 0.0) {
            // Illumination
            let l = Math.sqrt(lightDirection.x**2 + lightDirection.y**2 + lightDirection.z**2)
            lightDirection.x /= l
            lightDirection.y /= l
            lightDirection.z /= l

            let dp = normal.x * lightDirection.x + normal.y * lightDirection.y + normal.z * lightDirection.z

            // Project triangles from 3D --> 2D
            let projectedA = multiplyMatrixVector(triTranslated.a, projMatrix);
            let projectedB = multiplyMatrixVector(triTranslated.b, projMatrix);
            let projectedC = multiplyMatrixVector(triTranslated.c, projMatrix);

            triProjected = new Triangle(projectedA, projectedB, projectedC)

            // Scale into view
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

            //console.log(dp)
            //console.log(triTranslated)


            drawTriangle(triProjected.a, triProjected.b, triProjected.c, dp);

        }
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





