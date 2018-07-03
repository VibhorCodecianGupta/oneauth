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

function addClient(payload) {
    let clientName = payload.body.clientname
    let clientDomains = payload.body.domain.replace(/ /g, '').split(';')
    let clientCallbacks = payload.body.callback.replace(/ /g, '').split(';')
    let defaultURL = payload.body.defaulturl.replace(/ /g, '')
    defaultURL = urlutils.prefixHttp(defaultURL)

    //Make sure all urls have http in them
    clientDomains.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })
    clientCallbacks.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })

    const params = {
      id: generator.genNdigitNum(10),
      secret: generator.genNcharAlphaNum(64),
      name: clientName,
      domain: clientDomains,
      defaultURL: defaultURL,
      callbackURL: clientCallbacks,
      userId: payload.user.id
    }

  return models.Client.create(params)
}


function editClient(payload) {
    let clientId = parseInt(payload.params.id)
    let clientName = payload.body.clientname
    let clientDomains = payload.body.domain.replace(/ /g, '').split(';')
    let defaultURL = payload.body.defaulturl.replace(/ /g, '')
    let clientCallbacks = payload.body.callback.replace(/ /g, '').split(';')
    let trustedClient = false
    if(payload.user.role === 'admin'){
        trustedClient = payload.body.trustedClient
    }
    defaultURL = urlutils.prefixHttp(defaultURL)
    //Make sure all urls have http in them
    clientDomains.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })
    clientCallbacks.forEach(function (url, i, arr) {
        arr[i] = urlutils.prefixHttp(url)
    })

    const params = {
      name: clientName,
      domain: clientDomains,
      defaultURL: defaultURL,
      callbackURL: clientCallbacks,
      trusted:trustedClient
    }

  return models.Client.update(params, {where: {id: clientId}})
}

module.exports = {
  getClientById, addClient, editClient, getAllClients, getAllClientsForUser
}
