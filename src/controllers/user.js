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

function findAllUsersWithFilter(trustedClient, filterArgs) {
  return User.findAll({
    attributes: trustedClient ? undefined : ["id", "username", "email", "firstname", "lastname", "mobile_number"],
    where: filterArgs || {},
  });
}

function queryFilter(query) {
  
  const filter = {};
  if (query.username) {
    filter.username = query.username
  }
  if (query.firstname) {
    filter.firstname = {
      $iLike: `${query.firstname}%`
    }
  }
  if (query.lastname) {
    filter.lastname = {
      $iLike: `${query.lastname}%`
    }
  }
  if (query.email) {
    let email = query.email
    email = email.split['@']
    email[0] = email[0].split('').filter(c => !(c === '.')).join('')
    email = email.join('@')
    filter.email = email
  }
  if (query.contact) {
    let contact = query.contact
    if(/^\d+$/.test(contact)) {
      filter.contact = {
        like: `%${contact}`
      }
    } else {
     }
  }
  if (query.verified) {
    let verify = (query.verified == 'true')
    if (verify) {
      filter.verifiedemail = {
        $ne: null
      }
    } else {
      filter.verifiedemail = {
        $eq: null
      }
    }
  }
  return filter
}


module.exports = {
  findUserById,
  updateUser,
  findAllUsersWithFilter,
  queryFilter
};
