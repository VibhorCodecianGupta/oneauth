/**
 * Created by championswimmer on 10/03/17.
 *
 * This is the /api/v1/clients path
 */
const router = require('express').Router()
const models = require('../../db/models').models
const cel = require('connect-ensure-login')
const Raven = require('raven')
const { addClient, editClient } = require('../../controllers/client')


router.post('/add', cel.ensureLoggedIn('/login'), async (req, res) => {
  // if (!req.user) {
  //        return res.status(403).send("Only logged in users can make clients")
  // }

    try {
        const client = await addClient(req)
        res.redirect('/clients/' + client.id)

    } catch(err) {
        Raven.captureException(err)
        req.flash('error', 'Could not create client')
        res.redirect('/users/me')
    }
})


router.post('/edit/:id', cel.ensureLoggedIn('/login'), async (req, res) => {

      try {
          const client = await editClient(req)
          res.redirect('/clients/' + client.id)

      } catch(err) {
          Raven.captureException(err)
          req.flash('error', 'Could not update client')
          res.redirect('/users/me')
      }
})


module.exports = router
