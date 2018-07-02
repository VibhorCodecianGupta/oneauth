/**
 * Created by championswimmer on 09/03/17.
 *
 * This is the /signup path
 */
const router = require('express').Router()
const models = require('../db/models').models
const passutils = require('../utils/password')
const makeGaEvent = require('../utils/ga').makeGaEvent
const mail = require('../utils/email')
const { getUserByParams } = require('../controllers/user')

router.post('/', makeGaEvent('submit', 'form', 'signup'), async (req, res) => {

    if (req.body.username.trim() === '') {
        req.flash('error', 'Username cannot be empty')
        return res.redirect('/signup')
    }
    if ((req.body.firstname.trim() === '') || (req.body.lastname.trim() === '')) {
        req.flash('error', 'Firstname and/or Lastname cannot be empty')
        return res.redirect('/signup')
    }
    if (req.body.email.trim() === '') {
        req.flash('error', 'Email cannot be empty')
        return res.redirect('/signup')
    }
    if ((req.body.password.trim() === '') || req.body.password.length < 5) {
        req.flash('error', 'Password too weak. Use 5 characters at least.')
        return res.redirect('/signup')
    }

    try {
        const User = await getUserByParams({username: req.body.username})
        if (User) {
            req.flash('error', 'Username already exists. Please try again.')
            return res.redirect('/signup')
        }
        const passhash = await passutils.pass2hash(req.body.password)
        const user = await models.UserLocal.create({
                            user: {
                                username: req.body.username,
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                email: req.body.email,
                                demographic: {
                                    branchId: req.body.branchId,
                                    collegeId: req.body.collegeId,
                                }
                            },
                            password: passhash
                        }, {
                            include: [{model: models.User, include: [models.Demographic]}]
                        })

                        mail.welcomeEmail(user.user.dataValues)
                        res.redirect('/login')

    } catch(err) {
      // Could not register user
      req.flash('error', 'Unsuccessful registration. Please try again.')
      return res.redirect('/signup')
    }

})

module.exports = router
