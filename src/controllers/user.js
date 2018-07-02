const {db, models} = require('../db/models')

const getUserById = function(id, includes) {
  return models.User.findOne({
      where: {id: id},
      include: includes
    })
}

const getUserOfTrustedClient = function(id, trustedClient) {
  return models.User.findOne({
      attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
      where: {id: id}
    })
}

const updateUserLocal = function(id) {
  return models.UserLocal.update({password: passHash}, {where: {userId: id}})
}

const updateUser = function(params, id) {
  return models.User.update(params,
        {
          where: {id:id},
          returning: true
        })
}

module.exports = {
  getUserById, getUserOfTrustedClient, updateUserLocal, updateUser
}
