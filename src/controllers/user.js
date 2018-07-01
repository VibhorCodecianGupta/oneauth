const {db, models} = require('../db/models')

const getUserById = function(id, includes) {
  return models.User.findOne({
      where: {id: id},
      include: includes
    })
    .then(user => resolve(user))
    .catch(err => reject(err))
}

const getUserOfTrustedClient = function(id, trustedClient) {
  return models.User.findOne({
      attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
      where: {id: id}
    })
    .then(user => resolve(user))
    .catch(err => reject(err))
}

const updateUserLocal = function(id) {
  return models.UserLocal.update({password: passHash}, {where: {userId: id}})
    .then(user => resolve(user))
    .catch(err => reject(err))
}

const updateUser = function(params, id) {
  return models.User.update(params,
        {
          where: {id:id},
          returning: true
        })
        .then(user => resolve(user))
        .catch(err => reject(err))
}

module.exports = {
  getUserById, getUserOfTrustedClient, updateUserLocal, updateUser
}
