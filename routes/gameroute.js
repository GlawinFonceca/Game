const gameRouter = require('express').Router();


gameRouter.post('/gamePage' ,async (req,res) => {
    const array =[];
    let random = Math.floor(Math.random() * 9);
    console.log(random);
     array.push(random)
    const number = array.includes(random)
    console.log(number);
    console.log(array);
    // if(random ===1 && !req.body.a1) {
    //     res.render('game', {
    //         title:'Game',
    //         a1:'o',
    //         Status:'USER'
    //     })
    // }
})


module.exports=gameRouter;