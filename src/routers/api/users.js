/**
 * Created by championswimmer on 10/03/17.
 *
 * This is the /api/v1/users path
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')
const passport = require('../../passport/passporthandler')
const models = require('../../db/models').models
const Raven = require('raven')

const { getUserById, getUserOfTrustedClient } = require('../../controllers/user')
const { destroyAuthToken } = require('../../controllers/oauth')
const { getAllAddresses } = require('../../controllers/demographics')

router.get('/me',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    async (req, res) => {

        if (req.user && !req.authInfo.clientOnly && req.user.id) {
            let includes = []
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                    }
                }
            }

            try {
                const user = await getUserById(req.user.id, includes)
                if(!user){
                    throw new Error("User not found")
                 }
                res.send(user)

            } catch(err) {
                res.send('Unknown user or unauthorized request')
            }

        } else {
            return res.status(403).json({error: 'Unauthorized'})
        }
    })

router.get('/me/address',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    async (req, res) => {
        if (req.user && req.user.id) {
            let includes = [{model: models.Demographic,
            include: [models.Address]
            }]
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                    }
                }
            }

            try {

                const user = await getUserById(req.user.id, includes)
                if(!user){
                    throw new Error("User not found")
                 }
                res.send(user)

            } catch(err) {
                res.send('Unknown user or unauthorized request')
            }

        } else {
            return res.sendStatus(403)
        }
    })


router.get('/me/logout',
    passport.authenticate('bearer', {session: false}),
    async (req, res) => {
        if (req.user && req.user.id) {
          try {

              let authToken = req.header('Authorization').split(' ')[1]
              await destroyAuthToken(authToken)
              res.status(202).send({
                  'user_id': req.user.id,
                  'logout': 'success'
              })

          } catch(err) {
              res.status(501).send(err)
          }

        } else {
            res.status(403).send("Unauthorized")
        }
    })


router.get('/:id',
    passport.authenticate('bearer', {session: false}),
    async (req, res) => {
        // Send the user his own object if the token is user scoped
        if (req.user && !req.authInfo.clientOnly && req.user.id) {
            if (req.params.id == req.user.id) {
                return res.send(req.user)
            }
        }
        let trustedClient = req.client && req.client.trusted
        try {
            const user = await getUserOfTrustedClient(req.params.id, trustedClient)
            if(!user){
                throw new Error("User not found")
            }
            res.send(user)

        } catch(err) {
            res.send('Unknown user or unauthorized request')
        }
    })


router.get('/:id/address',
    // Only for server-to-server calls, no session auth
    passport.authenticate('bearer', {session: false}),
    async (req, res) => {
        let includes = [{model: models.Demographic,
            include: [{model: models.Address, include:[models.State, models.Country]}]
        }]

        if (!req.authInfo.clientOnly) {
            // If user scoped token

            // Scoped to some other user: Fuck off bro
            if (req.params.id != req.user.id) {
                return res.status(403).json({error: 'Unauthorized'})
            }
        } else {
            // If not user scoped

            // Check if trusted client or not
            if (!req.client.trusted) {
                return res.status(403).json({error: 'Unauthorized'})
            }
        }
        try {
            const addresses = await getAllAddresses(req.params.id, includes)
            return res.json(addresses)

        } catch(err) {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            res.status(500).json({error: err.message})
        }
    })

module.exports = router
