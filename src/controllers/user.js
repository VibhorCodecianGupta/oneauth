const {db, models} = require('../db/models')

function getUserById(id, includes) {
  return models.User.findOne({
      where: {id: id},
      include: includes
    })
}

function getUserByParams(params) {
  return models.User.findOne({where: params})
}

function getUserOfTrustedClient(id, trustedClient) {
  return models.User.findOne({
      attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
      where: {id: id}
    })
}

function updateUserLocal(id, pass) {
  return models.UserLocal.update({password: pass}, {where: {userId: id}})
}

function updateUser(params, id, bool) {
  return models.User.update(params,
        {
          where: {id:id},
          returning: bool
        })
}

module.exports = {
  getUserById, getUserOfTrustedClient, updateUserLocal, updateUser, getUserByParams
}
