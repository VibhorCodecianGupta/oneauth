const {db, models} = require('../db/models')

function findOrCreateDemographics(id) {
    return models.Demographic.findCreateFind({
        where: {userId: id},
        include: [models.Address]
    })
}

function getDemographics(id) {
    return models.Demographic.findOne({where: {userId: id}})
}

function updateDemographic(demographic, id) {
    return models.Demographic.upsert(demographic, {where: {userId: req.user.id}})
}

function getAddress(addrId, userId) {
    return models.Address.findOne({
        where: {
            id: addrId,
            '$demographic.userId$': userId
        },
        include: [models.Demographic, models.State, models.Country]
    })
}

function getAllAddresses(id, includes) {
    return models.Address.findAll({
      where: {'$demographic.userId$': id},
      include: includes
    })
}

function createAddress(params) {
    return models.Address.create(params)
}

function updateAddressbyDemoId(id, params) {
    return models.Address.update(params, {where: {demographicId: id}})
}

function updateAddressbyId(id, params) {
    return models.Address.update(params, {where: {id: id}})
}

function getStates() {
    return models.State.findAll({})
}

function getCountries() {
    return models.Country.findAll({})
}

function getColleges() {
    return models.College.findAll({})
}

function getBranches() {
    return models.Branch.findAll({})
}

module.exports = {
  findOrCreateDemographics, getDemographics, createAddress,
  updateAddressbyDemoId, updateAddressbyId, getAllAddresses,
  getStates, getCountries, getAddress, getColleges, getBranches,
  updateDemographic
}
