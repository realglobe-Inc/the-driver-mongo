/**
 * Driver for mongo db
 * @augments Driver
 * @class MongoDriver
 * @inheritdoc
 */
'use strict'

const asleep = require('asleep')
const clayCollection = require('clay-collection')
const {DateFormats, LogPrefixes} = require('clay-constants')
const {Driver} = require('clay-driver-base')
const clayEntity = require('clay-entity')
const clayId = require('clay-id')
const {pageToOffsetLimit} = require('clay-list-pager')
const clayResourceName = require('clay-resource-name')
const {unlessProduction} = require('the-check')
const {parseFilter, parseInboundAttributes, parseOutboundAttributes, parseSort} = require('./helpers/parser')
const m = require('./mixins')

const asEntity = (values) => {
  const entity = clayEntity(parseOutboundAttributes(values))
  delete entity._id
  return entity
}

const MongoDriverBase = [
  m.mongoMix
].reduce((Driver, mix) => mix(Driver), Driver)

/** @lends MongoDriver */
class MongoDriver extends MongoDriverBase {
  constructor (config) {
    super()
    const {
      database,
      host,
      password,
      port,
      ssl = false,
      username,
      ...rest
    } = config

    unlessProduction(() => {
      const restKeys = Object.keys(rest)
      if (restKeys.length > 0) {
        console.warn(`[MongoDriver] Unknown config`, restKeys)
      }
    })

    this._dbConnecting = this.connectToMongo({
      database, host, password, port, ssl, username,
    }).then((db) => {
      this.db = db
    }).catch((err) => {
      console.error(err)
      process.exit(1)
    }).then(() => {
      this._dbConnecting = null
    })
  }

  async close () {
    await this._dbConnecting
    await asleep(10)
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  async create (resourceName, attributes) {
    const _id = this.mongoObjectId()
    const collection = await this._collectionFor(resourceName)
    const id = String(attributes.id || _id)
    await collection.insert({
      _id: this.mongoObjectId(_id),
      id,
      ...parseInboundAttributes(attributes),
    })
    return await this.one(resourceName, id)
  }

  async destroy (resourceName, id) {
    const collection = await this._collectionFor(resourceName)
    const destroyed = await collection.deleteOne({
      _id: this.mongoObjectId(id),
    })
    return destroyed.deletedCount
  }

  async drop (resourceName) {
    const collection = await this._collectionFor(resourceName)
    collection.drop()
  }

  async dump (dirname, options = {}) {
    await this._dbConnecting
    throw new Error('Not implemented!')
  }

  async list (resourceName, condition = {}) {
    const collection = await this._collectionFor(resourceName)
    const {filter = {}, page = {}, sort = []} = condition
    const {limit, offset} = pageToOffsetLimit(page)
    const query = parseFilter(filter)
    const found = await collection.find(query, {
      limit,
      skip: offset,
      sort: parseSort(sort),
    })
    const entities = await found.toArray()
    const count = await collection.count(query)
    return clayCollection({
      entities: entities.map((found) => asEntity(found)),
      meta: {
        length: entities.length,
        limit,
        offset,
        total: count,
      },
    })
  }

  async one (resourceName, id) {
    const collection = await this._collectionFor(resourceName)
    const found = await collection.findOne({id: String(id)})
    if (!found) {
      return null
    }
    return asEntity(found)
  }

  async resources () {
    await this._dbConnecting
    const {db} = this
    const info = this.db.listCollections({})
    const resourceNames = (await info.toArray()).map((name) => name)
    return resourceNames.map((resourceName) => {
      const {domain, name} = clayResourceName(resourceName)
      return {domain, name}
    })
  }

  async restore (dirname, options = {}) {
    await this._dbConnecting
    throw new Error('Not implemented!')
  }

  async update (resourceName, id, attributes) {
    const collection = await this._collectionFor(resourceName)
    const $set = parseInboundAttributes(
      Object.assign({},
        ...Object.entries(attributes).map(([k, v]) => /^\$|^_id$/.test(k) ? null : ({
          [k]: v,
        })).filter(Boolean),
      )
    )
    const isEmpty = Object.keys($set).length === 0
    if (!isEmpty) {
      await collection.updateOne({
          _id: this.mongoObjectId(id),
        }, {
          $set: $set,
        }
      )
    }
    return await this.one(resourceName, id)
  }

  async _collectionFor (resourceName) {
    await this._dbConnecting
    if (!this.db) {
      throw new Error(`DB Already closed`)
    }
    const collection = this.db.collection(resourceName)
    await collection.ensureIndex('id')
    return this.enhanceMongoCollection(collection)
  }
}

module.exports = MongoDriver
