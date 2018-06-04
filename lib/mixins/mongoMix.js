/**
 * Mixin of mongodb
 * @function mongoMix
 */
'use strict'

const uriBuilder = require('mongo-uri-builder')
const mongojs = require('mongojs')

/** @lends mongoMix */
function mongoMix (Class) {
  class MongoMixed extends Class {

    connectToMongo ({database, host, password, port, ssl, username}) {
      const uri = uriBuilder({
        database: 'db',
        host,
        options: {},
        password,
        port,
        username,

      })
      console.log('Connecting database:', uri)
      return mongojs(uri)
    }
  }

  return MongoMixed
}

module.exports = mongoMix
