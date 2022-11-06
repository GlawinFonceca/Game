const gameRouter = require('express').Router();
const getConnection = require('../database/connection');
const jwtdecode = require('../helper/jwtdecode');

function generateindexOfMatrixEmptyElements(num) {
    let item = Math.floor(Math.random() * (num - 1));
    return item;
}

function botDecision() {
    let item = Math.floor(Math.random() * 2);
    if (item === 0) {
        return 'x';
    }
    else {
        return 'o';
    }
}

function winnerSelection(matrix) {
    if (matrix[0] === 'x' && matrix[1] === 'o' && matrix[2] === 'x') {
        return true
    }
    if (matrix[3] === 'x' && matrix[4] === 'o' && matrix[5] === 'x') {
        return true
    }


    if (matrix[6] === 'x' && matrix[7] === 'o' && matrix[8] === 'x') {
        return true
    }


    if (matrix[0] === 'x' && matrix[3] === 'o' && matrix[6] === 'x') {
        return true
    }

    if (matrix[1] === 'x' && matrix[4] === 'o' && matrix[7] === 'x') {
        return true
    }

    if (matrix[2] === 'x' && matrix[5] === 'o' && matrix[8] === 'x') {
        return true
    }

    if (matrix[0] === 'x' && matrix[4] === 'o' && matrix[8] === 'x') {
        return true
    }

    if (matrix[2] === 'x' && matrix[4] === 'o' && matrix[6] === 'x') {
        return true
    }
}

function botWinnerSelection(matrix) {
    if (matrix[0] === 'x' && matrix[1] === 'o' && matrix[2] === 'x') {
        return true
    }
    if (matrix[3] === 'x' && matrix[4] === 'o' && matrix[5] === 'x') {
        return true
    }


    if (matrix[6] === 'x' && matrix[7] === 'o' && matrix[8] === 'x') {
        return true
    }


    if (matrix[0] === 'x' && matrix[3] === 'o' && matrix[6] === 'x') {
        return true
    }

    if (matrix[1] === 'x' && matrix[4] === 'o' && matrix[7] === 'x') {
        return true
    }

    if (matrix[2] === 'x' && matrix[5] === 'o' && matrix[8] === 'x') {
        return true
    }

    if (matrix[0] === 'x' && matrix[4] === 'o' && matrix[8] === 'x') {
        return true
    }

    if (matrix[2] === 'x' && matrix[4] === 'o' && matrix[6] === 'x') {
        return true
    }
}

gameRouter.post('/gamePage', async (req, res) => {
    const matrix = [req.body.a0, req.body.a1, req.body.a2, req.body.a3, req.body.a4, req.body.a5, req.body.a6,
    req.body.a7, req.body.a8];
    
    let draw = matrix.every((e) => e !=='')
    if(draw == true){
        res.render('views', {
            title: 'Welcome',
            message: 'Draw'
        })

    }
    

    let result = winnerSelection(matrix);
    if (result === true) {
        const connection = await getConnection();
        const userToken = req.cookies['userToken'];
        const userId = jwtdecode(userToken);
        const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
        if (userData.access_token === userToken) {
            await connection.execute(`UPDATE user SET points=points+100,win_games=win_games+1,total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
        }
        res.render('views', {
            title: 'Welcome',
            message: 'Winner '
        })
    }
    else {
        //taking index of empty elements in matrix array
        const indexOfMatrixEmptyElements = matrix.map((item, i) => item == '' ? i : false).filter((x) => x != false);

        //return index indexOfMatrixEmptyElements
        const indexForBotSelection = generateindexOfMatrixEmptyElements(indexOfMatrixEmptyElements.length)
        const botSelectedData = botDecision();

        const botSelectedIndex = indexOfMatrixEmptyElements[indexForBotSelection];

        if (botSelectedIndex) {
            matrix.splice(botSelectedIndex, 1, botSelectedData);
            let result = botWinnerSelection(matrix);
            if (result === true) {
                const connection = await getConnection();
                const userToken = req.cookies['userToken'];
                const userId = jwtdecode(userToken);
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
                if (userData.access_token === userToken) {
                    await connection.execute(`UPDATE user SET points=points-50,total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
                }
                res.render('views', {
                    title: 'Welcome',
                    message: 'Winner is Bot'
                })
            }
           
            res.render('game', {
                title: 'Game',
                Status: 'USER',
                arr0: matrix[0],
                arr1: matrix[1],
                arr2: matrix[2],
                arr3: matrix[3],
                arr4: matrix[4],
                arr5: matrix[5],
                arr6: matrix[6],
                arr7: matrix[7],
                arr8: matrix[8],

            })
        }
    }
})

module.exports = gameRouter;