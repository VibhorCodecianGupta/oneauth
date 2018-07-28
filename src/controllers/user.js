const { User } = require("../db/models").models;

function findUserById(id, includes) {
  return User.findOne({
    where: { id },
    include: includes
  });
}

function findUserByParams(params) {
  return models.User.findOne({where: params})
}

function createUserLocal(params, pass, includes) {
  return models.UserLocal.create({user: params, password: pass}, {include: includes})
}

function updateUser(userid, newValues) {
  return User.update(newValues, {
    where: { id: userid },
    returning: true
  });
}

function findUserForTrustedClient(trustedClient, userId) {
  return User.findOne({
    attributes: trustedClient ? undefined : ["id", "username", "photo"],
    where: { id: userId }
  });
}

module.exports = {
  findUserById,
  findUserByParams,
  createUserLocal,
  updateUser,
  findUserForTrustedClient
};
