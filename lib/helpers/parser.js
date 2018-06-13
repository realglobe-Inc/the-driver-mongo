'use strict'

const {refTo} = require('clay-resource-ref')
const {typeOf, withType} = require('clay-serial')
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
  if (Array.isArray(filter)) {
    return filter.map((f) => parseFilter(f))
  }
  const parsed = {}
  for (const [k, v] of Object.entries(filter)) {
    switch (typeof v) {
      case 'object': {
        if (v.$ref) {
          parsed[k] = {[escape('$ref')]: v.$ref}
        } else {
          parsed[k] = v
        }
        break
      }
      default:
        parsed[k] = v
        break
    }
  }
  return parsed
}

module.exports = {
  parseFilter,
  parseInboundAttributes,
  parseOutboundAttributes,
  parseSort,
}
