const { User } = require("../db/models").models;

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

function findAllUsersForTrustedClient(trustedClient, where) {
  return User.findAll({
    attributes: trustedClient ? undefined : ["id", "username", "email", "firstname", "lastname", "mobile_number"],
    where: where || {},
  });
}


module.exports = {
  findUserById,
  updateUser,
  findUserForTrustedClient,
  findAllUsersForTrustedClient
};
