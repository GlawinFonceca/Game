const arr = [
    ["x", "o", "x"],
    ["o", "o", "x"],
    ["x", "o", "x"]
]
let count = 0;
function increment() {
    count++;
}
if (arr[0][0] === 'x' && arr[0][1] === 'o' && arr[0][2] === 'x') {
    increment();
}

if (arr[1][0] === 'x' && arr[1][1] === 'o' && arr[1][2] === 'x') {
    increment();
}

if (arr[2][0] === 'x' && arr[2][1] === 'o' && arr[2][2] === 'x') {
    increment();
}

if (arr[0][0] === 'x' && arr[1][0] === 'o' && arr[2][0] === 'x') {
    increment();
}

if (arr[0][1] === 'x' && arr[1][1] === 'o' && arr[2][1] === 'x') {
    increment();
}

if (arr[0][2] === 'x' && arr[1][2] === 'o' && arr[2][2] === 'x') {
    increment();
}

if (arr[0][0] === 'x' && arr[1][1] === 'o' && arr[2][2] === 'x') {
    increment();
}

if (arr[0][2] === 'x' && arr[1][1] === 'o' && arr[2][0] === 'x') {
    increment();
}

console.log(count);



