/**
 * Driver for mongo db
 * @augments Driver
 * @class TheDriverMongo
 * @inheritdoc
 */
'use strict'

const clayCollection = require('clay-collection')
const {DateFormats, LogPrefixes} = require('clay-constants')
const {Driver} = require('clay-driver-base')
const clayEntity = require('clay-entity')
const clayResourceName = require('clay-resource-name')
const m = require('./mixins')

const TheDriverMongoBase = [
  m.mongoMix
].reduce((Driver, mix) => mix(Driver), Driver)

/** @lends TheDriverMongo */
class TheDriverMongo extends TheDriverMongoBase {
  constructor (config) {
    super()
    const {
      database,
      host,
      password,
      port,
      ssl = false,
      username,
    } = config
    const db = this.connectToMongo({
      database, host, password, port, ssl, username,
    })

    this.db = db
  }

  _collectionFor (resourceName) {
    return this.db.collection(resourceName)
  }

  async close () {
    this.db.close()
    this.db = null
  }

  async create (resourceName, attributes) {
    const collection = this._collectionFor(resourceName)
  }

  async destroy (resourceName, id) {
    const collection = this._collectionFor(resourceName)
  }

  async drop (resourceName) {
    const collection = this._collectionFor(resourceName)
  }

  async dump (dirname, options = {}) {
  }

  async list (resourceName, condition = {}) {
    const collection = this._collectionFor(resourceName)
    const {filter = {}, page = {}, sort = []} = condition
  }

  async one (resourceName, id) {
    const collection = this._collectionFor(resourceName)
  }

  async resources () {
    const resourceNames = this.db.getCollectionNames()
    return resourceNames.map((resourceName) => {
      const {name, domain} = clayResourceName(resourceName)
      return {name, domain}
    })
  }

  async restore (dirname, options = {}) {
  }

  async update (resourceName, id, attributes) {
    const collection = this._collectionFor(resourceName)
  }
}

module.exports = TheDriverMongo
