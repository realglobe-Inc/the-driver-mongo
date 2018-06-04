/**
 * Mixin of mongodb
 * @function mongoMix
 */
'use strict'

const {cleanup} = require('asobj')
const uriBuilder = require('mongo-uri-builder')
const {MongoClient, ObjectID} = require('mongodb')
const {promisify} = require('util')
const debug = require('debug')('the:driver:mongo')

/** @lends mongoMix */
function mongoMix (Class) {
  class MongoMixed extends Class {

    enhanceMongoCollection (c) {
      c.insertAsync = promisify(c.insert.bind(c))
      c.countAsync = promisify(c.count.bind(c))
      c.countAsync = promisify(c.count.bind(c))
      c.findAsync = promisify(c.find.bind(c))
      c.findOneAsync = promisify(c.findOne.bind(c))
      c.updateOneAsync = promisify(c.updateOne.bind(c))
      c.deleteOneAsync = promisify(c.deleteOne.bind(c))
      return c
    }

    mongoObjectId (id) {
      if (!id) {
        return new ObjectID()
      }
      return new ObjectID(String(id))
    }

    async connectToMongo ({database, host, password, port, ssl, username}) {
      const uri = uriBuilder(cleanup({
        host,
        options: {},
        password,
        port,
        username,
      }))
      debug('Connecting database:', uri)
      const client = await new Promise((resolve, reject) => {
        MongoClient.connect(uri, (err, client) => err ? reject(err) : resolve(client))
      })
      const db = client.db(database)
      db.client = client
      db.close = () => client.close()
      return db
    }
  }

  return MongoMixed
}

module.exports = mongoMix
