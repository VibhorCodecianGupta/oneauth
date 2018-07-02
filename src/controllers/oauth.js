const {db, models} = require('../db/models')
const generator = require('../utils/generator')
const config = require('../../config')

const generateGrantCode = function(clientId, userId) {
  return models.GrantCode.create({
      code: generator.genNcharAlphaNum(config.GRANT_TOKEN_SIZE),
      clientId: clientId,
      userId: userId
    })
}

const findGrantCode = function(code) {
  return models.GrantCode.findOne({
      where: {code: code},
      include: [models.Client]
    })
}

const destroyGrantCode = function(grantCode) {
  return grantCode.destroy()
}

const generateRefreshToken = function(clientId, userId) {
  return models.AuthToken.create({
      token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
      scope: ['*'],
      explicit: false,
      clientId: clientId,
      userId: userId
    })
}

const generateAuthToken = function(clientId, userId) {
  return models.AuthToken.create({
      token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
      scope: ['*'],
      explicit: false,
      clientId: clientId,
      userId: userId
  })
}

const findAuthToken = function(clientId, userId) {
  return models.AuthToken.findOne({
        where: {
          clientId: client.id,
          userId: user.id
        }
    })
}

const findAllTokens = function(userId) {
  return models.AuthToken.findAll({
        where: {userId: userId},
        include: [models.Client]
      })
}

const findCreateAuthToken = function(grantCode) {
  return models.AuthToken.findCreateFind({
        where: {
            clientId: grantCode.clientId,
            userId: grantCode.userId,
            explicit: true
        },
        defaults: {
            token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
            scope: ['*'],
            explicit: true,
            clientId: grantCode.clientId,
            userId: grantCode.userId
        }
    })
}

const destroyAuthToken = function(authToken) {
  return models.AuthToken.destroy({where: { token: authToken }})
}

module.exports = {
  generateGrantCode, findGrantCode, destroyGrantCode, generateRefreshToken,
  generateAuthToken, findAuthToken, findCreateAuthToken, destroyAuthToken,
  findAllTokens
}
