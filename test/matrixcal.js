const arr = [
    ["x", "p", "x"],
    ["o", "v", "o"],
    ["o", "o", "o"]
]
const match = ["x", "o", "x"];
let count = 0;
function increment() {
    count++;
}
//row calculation
function rowCalculation() {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] === 'x' && arr[i][1] === 'o' && arr[i][2] === 'x') {
            increment();
        }
    }
}


//column calculation
function columnCalculation() {
    const column1 = arr.map((d) => d[0]);
    const column2 = arr.map((d) => d[1]);
    const column3 = arr.map((d) => d[2]); 
    const result1 = JSON.stringify(column1) === JSON.stringify(match);
    if (result1 === true) {
        increment()
    }

    const result2 = JSON.stringify(column2) === JSON.stringify(match);
    if (result2 === true) {
        increment()
    }

    const result3 = JSON.stringify(column3) === JSON.stringify(match);
    if (result3 === true) {
        increment()
    }
}


//diagonal calculation
function diagonalCalculation() {
    const pDiagonal = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (i == j)
                pDiagonal.push(arr[i][j])

        }
    }

    const Pdiagonal = JSON.stringify(pDiagonal) === JSON.stringify(match);
    if (Pdiagonal === true) {
        increment()
    }

    const sDiagonal = []
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if ((i + j) === 2)
                sDiagonal.push(arr[i][j])
        }
    }
    
    const Sdiagonal = JSON.stringify(sDiagonal) === JSON.stringify(match);
    if (Sdiagonal === true) {
        increment()
    }
}

rowCalculation();
columnCalculation();
diagonalCalculation();
console.log(count);


