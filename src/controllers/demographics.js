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

function createAddress(payload, demographics) {

    const params = {
      label: payload.body.label,
      first_name: payload.body.first_name,
      last_name: payload.body.last_name,
      mobile_number: payload.body.number,
      email: payload.body.email,
      pincode: payload.body.pincode,
      street_address: payload.body.street_address,
      landmark: payload.body.landmark,
      city: payload.body.city,
      stateId: payload.body.stateId,
      countryId: payload.body.countryId,
      demographicId: demographics.id,
      // if no addresses, then first one added is primary
      primary: !demographics.get().addresses
    }
    return models.Address.create(params)
}

function updateAddressbyDemoId(id, params) {
    return models.Address.update(params, {where: {demographicId: id}})
}

function updateAddressbyId(payload, id) {

    const params = {
      label: payload.body.label,
      first_name: payload.body.first_name,
      last_name: payload.body.last_name,
      mobile_number: payload.body.number,
      email: payload.body.email,
      pincode: payload.body.pincode,
      street_address: payload.body.street_address,
      landmark: payload.body.landmark,
      city: payload.body.city,
      stateId: payload.body.stateId,
      countryId: payload.body.countryId,
      primary: payload.body.primary === 'on'
    }

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
