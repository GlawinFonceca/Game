// const jwt=require('jsonwebtoken');
// const accessToken =jwt.sign({
//     data: 'foobar'
//   }, 'secret', { expiresIn: 100 }); 
// console.log(accessToken);

let arr = [1, 2, 3, 4, 5];

let test = arr.map((number) => {
  if (number > 2)
    return 'glawin'
});
console.log(test);

    // let item = Math.floor(Math.random() * matrix.length);

    // if (matrix[item] === '') {
    //     matrix.splice(item, 1, 'o')
    //     console.log(matrix);
    // }