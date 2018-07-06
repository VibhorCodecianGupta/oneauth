const {db, models} = require('../db/models')
const generator = require('../utils/generator')
const urlutils = require('../utils/urlutils')

function getClientById(id) {
    return models.Client.findOne({where: {id: id}})
}

function getAllClients() {
  return models.Client.findAll({})
}

function getAllClientsForUser(userId) {
  return models.Client.findAll({where: {userId: userId}})
}

function addClient(params) {
    params.defaultURL = urlutils.prefixHttp(defaultURL)
    //Make sure all urls have http in them
    params.clientDomains.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })
    params.clientCallbacks.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })

    const parameters = {
      id: generator.genNdigitNum(10),
      secret: generator.genNcharAlphaNum(64),
      name: params.clientName,
      domain: params.clientDomains,
      defaultURL: params.defaultURL,
      callbackURL: params.clientCallbacks,
      userId: userId
    }

  return models.Client.create(parameters)
}


function editClient(params) {
    params.defaultURL = urlutils.prefixHttp(defaultURL)
    //Make sure all urls have http in them
    params.clientDomains.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })
    params.clientCallbacks.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })

    const parameters = {
      name: params.clientName,
      domain: params.clientDomains,
      defaultURL: params.defaultURL,
      callbackURL: params.clientCallbacks,
      trusted: params.trustedClient
    }

  return models.Client.update(parameters, {where: {id: params.clientId}})
}

module.exports = {
  getClientById, addClient, editClient, getAllClients, getAllClientsForUser
}
