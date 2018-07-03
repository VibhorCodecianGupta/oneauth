const router = require('express').Router()
const {db, models} = require('../../db/models')
const generator = require('../../utils/generator')
const cel = require('connect-ensure-login')
const Raven = require('raven')
const urlutils = require('../../utils/urlutils')
const {hasNull} = require('../../utils/nullCheck')
const { findOrCreateDemographics, getDemographics, createAddress, updateAddressbyDemoId, updateAddressbyId } = require('../../controllers/demographics')

router.post('/', cel.ensureLoggedIn('/login'), async (req, res) => {
    if (hasNull(req.body, ['label', 'first_name', 'last_name', 'number', 'email', 'pincode', 'street_address', 'landmark', 'city', 'stateId', 'countryId'])) {
        res.send(400)
    } else {
        if (req.query) {
         var redirectUrl = req.query.returnTo;
        }
        try {
            const [demographic, created] = await findOrCreateDemographics(req.user.id)
            const address = await createAddress(req, demographic)

            if (req.body.returnTo) {
                res.redirect(req.body.returnTo)
            } else{
                res.redirect('/address/' + address.id)
            }
        } catch(err) {
            Raven.captureException(err)
            req.flash('error', 'Error inserting Address')
            res.redirect('/users/me')
        }
    }
})

router.post('/:id', cel.ensureLoggedIn('/login'), async (req, res) => {
    if (hasNull(req.body, ['label', 'first_name', 'last_name', 'number', 'email', 'pincode', 'street_address', 'landmark', 'city', 'stateId', 'countryId'])) {
        return res.send(400)
    }

    let addrId = parseInt(req.params.id)
    let userId = parseInt(req.user.id)

    try {

      await db.transaction(async (t) => {
          if (req.body.primary === 'on') {

              let demo = await getDemographics(req.user.id)
              let demoId = demo.id
              await updateAddressbyDemoId(demoId, {primary:false})
          }

          await updateAddressbyId(req, addrId)
          res.redirect(`/address/${addrId}`)
      })

    } catch (err) {
        Raven.captureException(err)
        req.flash('error', 'Could not update address')
        res.redirect('/address')
    }

})


module.exports = router
