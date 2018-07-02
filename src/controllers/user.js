const {db, models} = require('../db/models')

const getUserById = function(id, includes) {
  return models.User.findOne({
      where: {id: id},
      include: includes
    })
}

const getUserByParams = function(params) {
  return models.User.findOne({where: params})
}

const getUserOfTrustedClient = function(id, trustedClient) {
  return models.User.findOne({
      attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
      where: {id: id}
    })
}

const updateUserLocal = function(id, pass) {
  return models.UserLocal.update({password: pass}, {where: {userId: id}})
}

const updateUser = function(params, id, bool) {
  return models.User.update(params,
        {
          where: {id:id},
          returning: bool
        })
}

module.exports = {
  getUserById, getUserOfTrustedClient, updateUserLocal, updateUser, getUserByParams
}
