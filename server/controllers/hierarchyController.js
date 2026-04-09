const {
  getAllHierarchyData,
  getExploreContent,
  getHierarchyTypeById,
  classifyGrammar,
  simulateString,
} = require('../services/hierarchyService')

const getHierarchy = (_req, res) => {
  res.json(getAllHierarchyData())
}

const getExplore = (_req, res) => {
  res.json(getExploreContent())
}

const getHierarchyType = (req, res) => {
  const { id } = req.params
  const typeData = getHierarchyTypeById(id)

  if (!typeData) {
    return res.status(404).json({ error: `Hierarchy type '${id}' not found` })
  }

  return res.json(typeData)
}

const simulateLanguage = (req, res) => {
  const { type, string } = req.body

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

const classifyGrammarController = (req, res) => {
  const { grammar } = req.body

  if (!grammar || typeof grammar !== 'string') {
    return res.status(400).json({ error: "Field 'grammar' is required and must be a string" })
  }

  const result = classifyGrammar(grammar)
  if (result.error) {
    return res.status(result.statusCode || 400).json({ error: result.error })
  }

  return res.json(result)
}

module.exports = {
  getHierarchy,
  getExplore,
  getHierarchyType,
  classifyGrammarController,
  simulateLanguage,
}
