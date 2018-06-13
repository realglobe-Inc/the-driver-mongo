/**
 * Test for MongoDriver.
 * Runs with mocha.
 */
'use strict'

const clayDriverTests = require('clay-driver-tests')
const MongoDriver = require('../lib/MongoDriver')
const asleep = require('asleep')
const {ok, equal} = require('assert')

describe('mongo-driver', () => {
  before(() => {
  })

  after(() => {
  })

  it('Do test', async () => {
    const driver = new MongoDriver({
      database: 'test-the-driver-mongo'
    })
    try {
      await driver.drop('User')

      const created = await driver.create('User', {
        name: 'user01',
        at: new Date()
      })
      equal(created.name, 'user01')
      ok(created.id)
      ok(created.at instanceof Date)

      {
        const one = await driver.one('User', created.id)
        equal(one.name, 'user01')
      }

      {
        const updated = await driver.update('User', created.id, {
          age: 33
        })
        equal(updated.age, 33)
        ok(updated.id)
      }
      {
        await driver.update('User', created.id, {})
      }

      {
        const list = await driver.list('User')
        equal(String(list.entities[0].id), String(created.id))
        equal(list.meta.total, 1)
      }

      {
        const destroyed = await driver.destroy('User', created.id)
        equal(destroyed, 1)
        const destroyed2 = await driver.destroy('User', created.id)
        equal(destroyed2, 0)
      }

      ok(
        await driver.resources()
      )

      {
        const hoge01 = await driver.create('Hoge', {
          $$at: new Date()
        })
        ok(hoge01.$$at)
      }

      {
        const group01 = await driver.create('Group', {name: 'group01'})
        const group02 = await driver.create('Group', {name: 'group02'})
        await driver.create('Entry', {name: 'entry01', group: {$ref: `Group#${group01}`}})
        await driver.create('Entry', {name: 'entry02', group: {$ref: `Group#${group01}`}})
        await driver.create('Entry', {name: 'entry21', group: {$ref: `Group#${group02}`}})
        equal(
          (await driver.list('Entry', {
            filter: {
              group: {
                $ref: `Group#${group01}`
              }
            }
          })).entities.length,
          2
        )
      }
      await driver.drop('Entry')
      await driver.drop('Group')
      await asleep(100)
    } finally {
      await driver.close()
    }

  })

  it('Run clayDriverTests', async () => {
    const driver = new MongoDriver({
      database: 'test-the-driver-mongo-2',
    })
    await clayDriverTests.run(driver)
    await asleep(100)
    await driver.close()
  })

})

/* global describe, before, after, it */
