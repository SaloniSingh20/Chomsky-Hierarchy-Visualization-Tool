const { classifyGrammar } = require('../server/services/hierarchyService')
const { parseJsonBody } = require('./_body')

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = parseJsonBody(req) || {}
  const { grammar } = body

  if (!grammar || typeof grammar !== 'string') {
    return res.status(400).json({ error: "Field 'grammar' is required and must be a string" })
  }

  const result = classifyGrammar(grammar)
  if (result.error) {
    return res.status(result.statusCode || 400).json({ error: result.error })
  }

  return res.json(result)
}
