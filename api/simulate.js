const { simulateString } = require('../server/services/hierarchyService')
const { parseJsonBody } = require('./_body')

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = parseJsonBody(req) || {}
  const { type, string } = body

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ error: "Field 'type' is required and must be a string" })
  }

  if (typeof string !== 'string') {
    return res.status(400).json({ error: "Field 'string' is required and must be a string" })
  }

  const result = simulateString(type, string)

  if (!result) {
    return res.status(400).json({ error: `Unsupported type '${type}'` })
  }

  return res.json(result)
}
