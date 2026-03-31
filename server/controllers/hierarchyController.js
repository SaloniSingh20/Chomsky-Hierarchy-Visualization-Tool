const {
  getAllHierarchyData,
  getHierarchyTypeById,
  simulateString,
} = require('../services/hierarchyService')

const getHierarchy = (_req, res) => {
  res.json(getAllHierarchyData())
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

module.exports = {
  getHierarchy,
  getHierarchyType,
  simulateLanguage,
}
