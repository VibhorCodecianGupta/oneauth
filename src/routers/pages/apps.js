/**
 * Created by bhavyaagg on 19/05/18.
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')
const { findAuthToken, findAllTokens } = require('../../controllers/oauth')
const Raven = require('raven')

const models = require('../../db/models').models

router.get('/',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
      try {
          const apps = await findAllTokens(req.user.id)
          res.render('apps/all', {apps: apps})

      } catch(err) {
          Raven.captureException(err)
          req.flash('error','Something went wrong, could not fetch apps')      }
    }
)

router.get('/:clientId/delete',cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
      try {
          const token = await findAuthToken(req.params.clientId, req.user.id)
          if (!token) {
              return res.send("Invalid App")
          }
          if (token.userId != req.user.id) {
              return res.send("Unauthorized user")
          }
          token.destroy();
          res.redirect('/apps/')

      } catch(err) {
        Raven.captureException(err)
        req.flash('error', 'Something went wrong, could not delete app')
      }
    }
)



module.exports = router
