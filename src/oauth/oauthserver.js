/**
 * Created by championswimmer on 10/03/17.
 */
const oauth = require('oauth2orize')
    , cel = require('connect-ensure-login')

const models = require('../db/models').models
    , generator = require('../utils/generator')
    , passport = require('../passport/passporthandler')
    , config = require('../../config')
    , debug = require('debug')('oauth:oauthserver')

const { getClientById } = require('../controllers/client')
const { generateGrantCode, generateRefreshToken, generateAuthToken, findAuthToken, findGrantCode, destroyGrantCode, findCreateAuthToken } = require('../controllers/oauth')

const server = oauth.createServer()

server.serializeClient(function (client, done) {
    return done(null, client.id)
})

server.deserializeClient(async (clientId, done) => {
    try {
        const client = await getClientById(clientId)
        return done(null, client)

    } catch(err) {
        debug(err)
    }
})

/**
 * Generates a  _grant code_
 * that has to be exchanged for an access token later
 */
server.grant(oauth.grant.code(
    async (client, redirectURL, user, ares, done) => {
        debug('oauth: getting grant code for ' + client.id + ' and ' + user.id)
        try {
          const grantCode = await generateGrantCode(client.id, user.id)
          return done(null, grantCode.code)

        } catch(err) {
            return done(err)
        }
    }
))

/**
 * Generate refresh token
 */
server.grant(oauth.grant.token(
    async (client, user, ares, done) => {
      try {
          const refreshToken = await generateRefreshToken(client.id, user.id)
          return done(null, authToken.token)

      } catch(err) {
          return done(err)
      }
    }
))

/**
 * Exchange **grant code** to get access token
 */
server.exchange(oauth.exchange.code(
    async (client, code, redirectURI, done) => {
        debug('oneauth: exchange')
        try {
            const grantCode = await findGrantCode(code)
            if (!grantCode) {
                return done(null, false) // Grant code does not exist
            }
            if (client.id !== grantCode.client.id) {
                return done(null, false) //Wrong Client ID
            }
            let callbackMatch = false
            for (url of client.callbackURL) {
                if (redirectURI.startsWith(url)) callbackMatch = true
            }
            if (!callbackMatch) {
                return done(null, false) // Wrong redirect URI
            }

            try {
                const [authToken, created] = findCreateAuthToken(grantCode)
                return done(null, authToken.token)
                await destroyGrantCode(grantCode)

            } catch(err) {
                return done(err)
            }
        } catch(err) {
            debug(err)
        }
    })
  )

//TODO: Implement all the other types of tokens and grants !

const authorizationMiddleware = [
    cel.ensureLoggedIn('/login'),
    server.authorization(async (clientId, callbackURL, done) => {
        debug('oauth: authorize')
        try {
            const client = await getClientById(clientId)
            if (!client) {
                return done(null, false)
            }
            debug(callbackURL)
            // We validate that callbackURL matches with any one registered in DB
            for (url of client.callbackURL) {
                if (callbackURL.startsWith(url)) {
                    return done(null, client, callbackURL)
                }
            }
            return done(null, false)

        } catch(err) {
            debug(err)
        }
    }, async (client, user, done) => {
        // Auto approve if this is trusted client
        if (client.trusted) {
            return done(null, true)
        }
        try {
            const token = await findAuthToken(client.id, user.id)
            if (!authToken) {
                return done(null, false)
            } else {
                return done(null, true)
            }
        } catch(err) {
            return done(err)
        }
    }),
     (req, res) => {
        res.render("authdialog", {
            transactionID: req.oauth2.transactionID,
            user: req.user,
            client: req.oauth2.client
        })
    }
]

// Exchange the client id and password/secret for an access token. The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth.exchange.clientCredentials(async (client, scope, done) => {
  // Validate the client
    try {
        const localClient = getClientById(client.get().id)
        if (!localClient) {
            return done(null, false);
        }
         if (localClient.get().secret !== client.get().secret) {
             // Password (secret) of client is wrong
             return done(null, false);
         }

         if (!localClient.get().trusted) {
             // Client is not trusted
             return done(null, false);
         }

         try {
            const authToken = await generateAuthToken(client.get().id, null)
            return done(null , authToken.get().token)

         } catch(err) {
            return done(err)
         }
    } catch(err) {
         done(err)
    }
  })
)

const decisionMiddleware = [
    cel.ensureLoggedIn('/login'),
    server.decision()
]

const tokenMiddleware = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),
    server.token(),
    server.errorHandler()
]
module.exports = {
    Middlewares: {tokenMiddleware, decisionMiddleware, authorizationMiddleware}
}
