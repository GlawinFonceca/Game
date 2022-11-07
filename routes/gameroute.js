const gameRouter = require('express').Router();
const getConnection = require('../database/connection');
const jwtdecode = require('../helper/jwtdecode');
const GLB = require('../constant/constant');

function generateRandomIndex(num) {
    let item = Math.floor(Math.random() * (num - 1));
    return item;
}

function getRandomBotDecision() {
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

function chooseUserTurn(matrix) {
    const turn = matrix.map((item, i) => item == '' ? i : 9).filter((x) => x != 9);
    return turn.length
}

gameRouter.post('/gamePage', async (req, res) => {
    try {
        const matrix = [req.body.a0, req.body.a1, req.body.a2, req.body.a3, req.body.a4, req.body.a5, req.body.a6,
        req.body.a7, req.body.a8];

        let result = winnerSelection(matrix);
        if (result === true) {
            const connection = await getConnection();
            const userToken = req.cookies['userToken'];
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                await connection.execute(`UPDATE user SET points=points+${GLB.WINNING_POINTS},win_games=win_games+1,total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
                return res.render('views', {
                    title: 'Welcome',
                    message: 'Winner '
                })
            }
        }
        else {
            const userTurn = chooseUserTurn(matrix);
            if (userTurn % 2 == 0) {
                //taking index of empty elements in matrix array
                const indexOfMatrixElements = matrix.map((item, i) => item == '' ? i : 9).filter((x) => x != 9);
                //return index indexOfMatrixEmptyElements
                const indexForBotSelection = generateRandomIndex(indexOfMatrixElements.length)
                const botSelectedData = getRandomBotDecision();

                const botSelectedIndex = indexOfMatrixElements[indexForBotSelection];

                matrix.splice(botSelectedIndex, 1, botSelectedData);
            }
            else {
                return res.render('game', {
                    title: 'Game',
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
                    message: "User's turn"
                })
            }

            let result = winnerSelection(matrix);
            if (result === true) {
                const connection = await getConnection();
                const userToken = req.cookies['userToken'];
                const userId = jwtdecode(userToken);
                const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
                if (userData.access_token === userToken) {
                    await connection.execute(`UPDATE user SET points=points-${GLB.DEDUCTING_POINTS},total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
                    return res.render('views', {
                        title: 'Welcome',
                        message: 'Winner is Bot'
                    })
                }
            }
        }

        let draw = matrix.every((e) => e !== '')
        if (draw == true) {
            const connection = await getConnection();
            const userToken = req.cookies['userToken'];
            const userId = jwtdecode(userToken);
            const userData = (await connection.execute(`SELECT * FROM user WHERE user_id='${userId}'`))[0][0];
            if (userData.access_token === userToken) {
                await connection.execute(`UPDATE user SET points=points+${GLB.DRAW_POINTS},total_game_played=total_game_played+1 WHERE email = '${userData.email}'`);
                return res.render('views', {
                    title: 'Welcome',
                    message: 'Match Draw'
                })
            }
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
    catch (e) {
        console.log('Game Page =>', e);
    }
})

module.exports = gameRouter;