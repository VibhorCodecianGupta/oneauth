const { User } = require("../db/models").models;

function findAllUsers() {
  return User.findAll({});
}

function findUserById(id, includes) {
  return User.findOne({
    where: { id },
    include: includes
  });
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
  findAllUsers,
  findUserById,
  updateUser,
  findUserForTrustedClient
};
