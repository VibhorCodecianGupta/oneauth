const { models } = require("../db/models");

const Sequelize = require('sequelize')
const config = require('../../config')
const secrets = config.SECRETS

const db_name = secrets.DB.NAME
const db_user = secrets.DB.USER
const db_pass = secrets.DB.PASSWORD
const db_host = secrets.DB.HOST

const DATABASE_URL = process.env.DATABASE_URL || ('postgres://' + db_user + ":" + db_pass + "@" + db_host + ":5432/" + db_name)

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: config.DEBUG ? console.log : false
})

function findOrCreateDemographic(userId) {
  return models.Demographic.findCreateFind({
    where: { userId: userId },
    include: [models.Address]
  });
}

function createAddress(options) {
  return models.Address.create(options);
}

function findDemographic(userId) {
  return models.Demographic.findOne({
    where: { userId: userId }
  });
}

function findAddress(userId, demoUserId) {
  return models.Address.findOne({
    where: {
      id: userId,
      "$demographic.userId$": demoUserId
    },
    include: [models.Demographic, models.State, models.Country]
  });
}

function updateAddressbyAddrId(addrId, options) {
  return models.Address.update(options, {
    where: { id: addrId }
  });
}

function updateAddressbyDemoId(demoId, options) {
  return models.Address.update(options, {
    where: { id: demoId }
  });
}

function findAllAddresses(userId, includes = [models.Demographic]) {
  return models.Address.findAll({
    where: { "$demographic.userId$": userId },
    include: includes
  });
}

function findAllStates() {
  return models.State.findAll({});
}

function findAllCountries() {
  return models.Country.findAll({});
}

function findAllBranches() {
  return models.Branch.findAll({});
}

function findAllColleges() {
  return sequelize.query('SELECT name FROM colleges ORDER BY convert_to(name, \'iso-8859-15\') ASC;')
  .spread((results, metadata) => {return results})
}

function upsertDemographic(id, userId, collegeId, branchId) {
  if ((!id) && (!userId)) {
    throw new Error("To upsert demographic either id or userid needed")
  }
  return models.Demographic.upsert({ id, userId, collegeId, branchId });
}

module.exports = {
  findOrCreateDemographic,
  updateAddressbyDemoId,
  updateAddressbyAddrId,
  findAddress,
  createAddress,
  findAllAddresses,
  findDemographic,
  findAllStates,
  findAllCountries,
  findAllBranches,
  findAllColleges,
  upsertDemographic
};
