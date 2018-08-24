/**
 * Created by championswimmer on 10/03/17.
 */
const oauth = require('oauth2orize')
    , cel = require('connect-ensure-login')
    , passport = require('../passport/passporthandler')
    , debug = require('debug')('oauth:oauthserver')

const {
    createGrantCode,
    createAuthToken,
    createRefreshToken,
    findGrantCode,
    findAuthToken, 
    findOrCreateAuthToken
} = require('../controllers/oauth');
const {findClientById} = require('../controllers/clients');

const server = oauth.createServer()

server.serializeClient(function (client, done) {
    return done(null, client.id)
})

server.deserializeClient(async function (clientId, done) {
    try {
        const client = await findClientById(clientId);
        return done(null, client);
    } catch (error) {
        debug(error)
    }
})

/**
 * Generates a  _grant code_
 * that has to be exchanged for an access token later
 */
server.grant(oauth.grant.code(
    async function (client, redirectURL, user, ares, done) {
        debug('oauth: getting grant code for ' + client.id + ' and ' + user.id)
        try {
            const grantCode = await createGrantCode(client.id,user.id);
            return done(null, grantCode.code);
        } catch (error) {
            return done(error)
        }
    }
))

/**
 * Generate refresh token
 */
server.grant(oauth.grant.token(
    async function (client, user, ares, done) {
        try {
            const refreshToken = await createRefreshToken(client.id,user.id);
            return done(null, refreshToken.token);
        } catch (error) {
            return done(error)
        }
    }
))

/**
 * Exchange **refresh token** to get access token
 */
server.exchange(oauth.exchange.refreshToken(function(client, refreshToken, scope, done){

      models.RefreshToken.findOne({
        where: {
          token: refreshToken
        },
        include: [models.Client]
      }).then(function(refreshToken) {

        if (!refreshToken) {
            return done(null, false) // token does not exist
        }
        if (client.id !== refreshToken.client.id) {
            return done(null, false) //Wrong Client ID
          }

          models.AuthToken.findOne({
            where: {
              clientId: refreshToken.clientId,
              userId: refreshToken.userId
            }
          }).then(function(authToken) {

              if(!authToken) {
                models.AuthToken.create({
                  token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
                  scope: ['*'],
                  explicit: true,
                  expires : Date.now() + 86400*1000,
                  clientId: refreshToken.clientId,
                  userId: refreshToken.userId
                }).then(function (authToken) {
                    return done(null, authToken.expires, authToken.token)
                })
              }

              var expired = Date.now() > authToken.expires ? true : false


              if(authToken && !expired) {
                  return done(null, authToken.token, refreshToken.token)
              }

              if(authToken && expired) {

                (async () => {
                  await authToken.destroy()
                })()

                models.AuthToken.create({
                  token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
                  expires: Date.now() + 86400*1000,
                  scope: ['*'],
                  explicit: true,
                  clientId: refreshToken.clientId,
                  userId: refreshToken.userId
                }).then(function (token) {
                  return done(null, token.token, refreshToken.token)
                })
              }
          }).catch(err => console.log(err))

      }).catch(err => console.log(err))
}))

/**
 * Exchange **grant code** to get access token
 */
server.exchange(oauth.exchange.code(
    async function (client, code, redirectURI, done) {
        try {
            const grantCode = await findGrantCode(code)    
            if (!grantCode) {
                return done(null,false) // Grant code does not exist
            }
            if (client.id !== grantCode.client.id) {
                return done(null,false) //Wrong Client ID
            }
            let callbackMatch = false
            for (url of client.callbackURL) {
                if (redirectURI.startsWith(url)) callbackMatch = true
            }
            if (!callbackMatch) {
                return done(null,false) // Wrong redirect URI
            }
            const [authToken, created] = await findOrCreateAuthToken(grantCode)
            grantCode.destroy()
            return done(null, authToken.token);
        } catch (error) {
            return done(error)
        }
    }
))

//TODO: Implement all the other types of tokens and grants !


const authorizationMiddleware = [
    cel.ensureLoggedIn('/login'),
    server.authorization(async function (clientId, callbackURL, done) {
        debug('oauth: authorize')
        try {
            const client = await findClientById(clientId);
            debug(callbackURL)
            for (url of client.callbackURL) {
                if (callbackURL.startsWith(url)) {
                    return done(null, client, callbackURL)
                }
            }
            return done(null, false);
        } catch (error) {
            debug(error)
        }
    }, async function (client, user, done) {
        // Auto approve if this is trusted client
        if (client.trusted) {
            return done(null, true)
        }
        try {
            const authToken = await findAuthToken(client.id,user.id)
            if (!authToken) {
                return done(null, false)
            } else {
                return done(null, true)
            }
        } catch (error) {
            return done(error);
        }

    }),
    function (req, res) {
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
        const localClient = await findClientById(client.get().id);
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

<<<<<<< HEAD
     // Everything validated, return the token
     const token = generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE)
     // Pass in a null for user id since there is no user with this grant type
     return models.AuthToken.create({
         token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
         scope: ['*'],
         explicit: false,
         expires: Date.now() + 86400*1000,
         clientId: client.get().id,
         userId: null // This is a client scoped token, so no related user here
     }).then((Authtoken) => {
      return done(null , Authtoken.get().token)
     })
       .catch((err) => {
         return done(err)
     });
 }).catch((err) => {
     return done(err)
 })
=======
        // Everything validated, return the token
        // const token = generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE)
        const authToken = await createAuthToken(client.get().id)
        return done(null,authToken.get().token)
    } catch (error) {
        debug(error)
    }
>>>>>>> e64a73ac2af0e64b5034fd430c243c8a0f15ec00
}));

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
