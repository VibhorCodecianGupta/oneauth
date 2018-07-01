const {db, models} = require('../db/models')

const findCreateDemographics = function(id) {
    return models.Demographic.findCreateFind({
        where: {userId: id},
        include: [models.Address]
    }).then(demographic => resolve(demographic))
    .catch(err => reject(err))
}

const getDemographics = function(id) {
    return models.Demographic.findOne({where: {userId: id}})
      .then(demographic => resolve(demographic))
      .catch(err => reject(err))
}

const updateDemographic = function(demographic, id) {
    return models.Demographic.upsert(demographic, {where: {userId: req.user.id}})
    .then(demog => resolve(demog))
    .catch(err => reject(err))
}

const getAddress = function(addrId, userId) {
    return models.Address.findOne({
        where: {
            id: addrId,
            '$demographic.userId$': userId
        },
        include: [models.Demographic, models.State, models.Country]
    }).then(addr => resolve(addr))
    .catch(err => reject(err))
}

const getAllAddresses = function(id, includes) {
    return models.Address.findAll({
      where: {'$demographic.userId$': id},
      include: includes
    }).then(addresses => resolve(addresses))
    .catch(err => reject(err))
}

const createAddress = function(payload, demographics) {

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
    .then(addr => resolve(addr))
    .catch(err => reject(err))
}

const updateAddressbyDemoId = function(id, params) {
    return models.Address.update(params, {where: {demographicId: id}})
      .then(addr => resolve(addr))
      .catch(err => reject(err))
}

const updateAddressbyId = function(payload, id) {

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
      .then(addr => resolve(addr))
      .catch(err => reject(err))
}

const getStates = function() {
    return models.State.findAll({})
}

const getCountries = function() {
    return models.Country.findAll({})
}

const getColleges = function() {
    return models.College.findAll({})
}

const getBranches = function() {
    return models.Branch.findAll({})
}

module.exports = {
  findCreateDemographics, getDemographics, createAddress,
  updateAddressbyDemoId, updateAddressbyId, getAllAddresses,
  getStates, getCountries, getAddress, getColleges, getBranches,
  updateDemographic
}
