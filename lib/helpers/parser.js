'use strict'

const {escape, unescape} = require('mongo-escape')
const SORT_DEST_PREFIX = /^-/

function parseSort (sort) {
  return [].concat(sort)
    .filter(Boolean)
    .reduce((names, name) => names.concat(name.split(',')), [])
    .filter(Boolean)
    .reduce((formatted, name) => {
      const isDesc = SORT_DEST_PREFIX.test(name)
      return {...formatted, [name]: isDesc ? -1 : 1}
    }, {})
}

function parseInboundAttributes (attributes) {
  return escape({...attributes}, true)
}

function parseOutboundAttributes (attributes) {
  return unescape({...attributes}, true)
}

function parseFilter (filter) {
  if (!filter) {
    return filter
  }
  return filter
}

module.exports = {
  parseFilter,
  parseInboundAttributes,
  parseOutboundAttributes,
  parseSort,
}
