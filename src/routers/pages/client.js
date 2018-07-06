/**
 * Created by championswimmer on 13/03/17.
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')
const acl = require('../../middlewares/acl')
const Raven = require('raven')
const { getAllClients, getClientById } = require('../../controllers/client')

const models = require('../../db/models').models


router.get('/',acl.ensureAdmin, async (req,res,next) => {
    try {
        const clients = await getAllClients()
        res.render('client/all',{clients:clients})

    } catch(err) {
        Raven.captureException(err)
        req.flash('error','Something went wrong, could not fetch clients')
        res.redirect('user/me')
    }
})

router.get('/add',
    cel.ensureLoggedIn('/login'),
     (req, res, next) => {
        res.render('client/add')
    }
)

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
      try {
          const client = await getClientById(req.params.id)
          if (!client) {
              return res.send("Invalid Client Id")
          }
          if (client.userId != req.user.id) {
              return res.send("Unauthorized user")
          }
          res.render('client/id', {client: client})
      } catch(err) {
          Raven.captureException(error)
          req.flash('error','Something went wrong, could not fetch client')
          res.redirect('client/all')
      }
    }
)

router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
      try {
          const client = await getClientById(req.param.id)
          if (!client) {
              return res.send("Invalid Client Id")
          }
          if (client.userId != req.user.id) {
              return res.send("Unauthorized user")
          }
          client.clientDomains = client.domain.join(";")
          client.clientCallbacks = client.callbackURL.join(";")
          client.clientdefaultURL = client.defaultURL;

          res.render('client/edit', {client: client})
      } catch(err) {
          Raven.captureException(err)
          req.flash('error','Something went wrong')
          res.redirect('client/id')
      }
    }
)

module.exports = router
