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


router.post('/add', async (req, res) => {
  if (!req.user) {
         return res.status(403).send("Only logged in users can make clients")
  }
  const query = {
      clientName: req.body.clientname,
      clientDomains: req.body.domain.replace(/ /g, '').split(';'),
      clientCallbacks: req.body.callback.replace(/ /g, '').split(';'),
      defaultURL: req.body.defaulturl.replace(/ /g, ''),
      userId: req.user.id
  }

    try {
        const client = await addClient(query)
        res.redirect('/clients/' + client.id)

    } catch(err) {
        Raven.captureException(err)
        req.flash('error', 'Could not create client')
        res.redirect('/users/me')
    }
})


router.post('/edit/:id', cel.ensureLoggedIn('/login'), async (req, res) => {

    const query = {
      clientId: parseInt(req.params.id),
      clientName: req.body.clientname,
      clientDomains: req.body.domain.replace(/ /g, '').split(';'),
      defaultURL: req.body.defaulturl.replace(/ /g, ''),
      clientCallbacks: req.body.callback.replace(/ /g, '').split(';'),
      trustedClient: false
    }
    if(req.user.role === 'admin'){
        query.trustedClient = req.body.trustedClient
    }

      try {
          const client = await editClient(query)
          res.redirect('/clients/' + query.clientId)

      } catch(err) {
          Raven.captureException(err)
          req.flash('error', 'Could not update client')
          res.redirect('/users/me')
      }
})


module.exports = router
