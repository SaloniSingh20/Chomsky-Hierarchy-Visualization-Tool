const { getHierarchyTypeById } = require('../../server/services/hierarchyService')

module.exports = function handler(req, res) {
  const { id } = req.query
  const typeData = getHierarchyTypeById(id)

  if (!typeData) {
    return res.status(404).json({ error: `Hierarchy type '${id}' not found` })
  }

  return res.json(typeData)
}
