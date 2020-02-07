const express = require('express')
const jsonBodyParser = express.json()
const AuthService = require('./auth-service')

const authRouter = express.Router()

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body
        const loginUser = { user_name, password }

    for (const [key, value] of Object.entries(loginUser))
       if (value == null)
        return res.status(400).json({
            error: `Missing '${key}' in request body`
        })

    //CHECK DATABASE TO SEE IF USER EXISTS
        AuthService.getUserWithUserName(req.app.get('db'), loginUser.user_name)
        .then(dbUser => {
            if (!dbUser) {
                return res.status(400).json({
                    error: 'Incorrect user_name or password'
                })
            }
            //USE BCRYPT TO VERIFY PASSWORD MATCH
            return AuthService.comparePasswords(loginUser.password, dbUser.password)
                .then(compareMatch => {
                    if (!compareMatch) {
                        return res.status(400).json({
                            error: 'Incorrect user_name or password'
                        })
                    }
                    
                    const sub = dbUser.user_name
                    const payload = { user_id: dbUser.id }
                    res.send({
                        authToken: AuthService.createJwt(sub, payload)
                    })

                })
        })
        .catch(next)

    

    })

module.exports = authRouter