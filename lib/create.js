/**
 * Create a TheDriverMongo instance
 * @function create
 * @param {...*} args
 * @returns {TheDriverMongo}
 */
'use strict'

const TheDriverMongo = require('./TheDriverMongo')

/** @lends create */
function create (...args) {
  return new TheDriverMongo(...args)
}

module.exports = create
