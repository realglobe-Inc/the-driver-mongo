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
    await driver.drop('User')

    const created = await driver.create('User', {name: 'user01'})
    equal(created.name, 'user01')
    ok(created.id)

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
    await driver.close()
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
