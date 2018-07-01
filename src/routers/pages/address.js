const router = require('express').Router()
const cel = require('connect-ensure-login')
const Raven = require('raven')
const { getAddress, getAllAddresses, getStates, getCountries } = require('../../controllers/demographics')
const models = require('../../db/models').models

router.get('/',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {

      try {
          let includes = [models.Demographic]
          const addresses = await getAllAddresses(req.user.id, includes)

          if (!addresses || !addresses.length) {
            req.flash('error', 'No addresses found')
            res.redirect('.')
          }
          res.render('address/all', {addresses})

      } catch(err) {
          Raven.captureException(err)
          req.flash('error', 'Something went wrong trying to query address database')
          res.redirect('/users/me')
      }
    }
)

router.get('/add',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        Promise.all([
            await getStates(),
            await getCountries()
        ]).then(function ([states, countries]) {
            return res.render('address/add', {states, countries})
        }).catch(function (err) {
            res.send("Error Fetching Data.")
        })
    }
)

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
      try {
          const address = await getAddress(req.params.id, req.user.id)
          if (!address) {
              req.flash('error', 'Address not found')
              res.redirect('.')
          }
          res.render('address/id', {address})

      } catch(err) {
        Raven.captureException(err)
        req.flash('error', 'Something went wrong trying to query address database')
        res.redirect('/users/me')
      }
    }
)


router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    async (req, res, next) => {
        Promise.all([
            await getAddress(req.params.id, req.user.id),
            await getStates(),
            await getCountries()
        ]).then(function ([address, states, countries]) {
            if (!address) {
                req.flash('error', 'Address not found')
                return res.redirect('.')
            }
            return res.render('address/edit', {address, states, countries})
        }).catch((err) => {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        })
    }
)

module.exports = router
