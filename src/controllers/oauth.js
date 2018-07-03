const {db, models} = require('../db/models')
const generator = require('../utils/generator')
const config = require('../../config')

function generateGrantCode(clientId, userId) {
  return models.GrantCode.create({
      code: generator.genNcharAlphaNum(config.GRANT_TOKEN_SIZE),
      clientId: clientId,
      userId: userId
    })
}

function findGrantCode(code) {
  return models.GrantCode.findOne({
      where: {code: code},
      include: [models.Client]
    })
}

function destroyGrantCode(grantCode) {
  return grantCode.destroy()
}

function generateRefreshToken(clientId, userId) {
  return models.AuthToken.create({
      token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
      scope: ['*'],
      explicit: false,
      clientId: clientId,
      userId: userId
    })
}

function generateAuthToken(clientId, userId) {
  return models.AuthToken.create({
      token: generator.genNcharAlphaNum(config.AUTH_TOKEN_SIZE),
      scope: ['*'],
      explicit: false,
      clientId: clientId,
      userId: userId
  })
}

function findAuthToken(clientId, userId) {
  return models.AuthToken.findOne({
        where: {
          clientId: client.id,
          userId: user.id
        }
    })
}

function findAllTokens(userId) {
  return models.AuthToken.findAll({
        where: {userId: userId},
        include: [models.Client]
      })
}

function findOrCreateAuthToken(grantCode) {
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

function destroyAuthToken(authToken) {
  return models.AuthToken.destroy({where: { token: authToken }})
}

module.exports = {
  generateGrantCode, findGrantCode, destroyGrantCode, generateRefreshToken,
  generateAuthToken, findAuthToken, findOrCreateAuthToken, destroyAuthToken,
  findAllTokens
}
