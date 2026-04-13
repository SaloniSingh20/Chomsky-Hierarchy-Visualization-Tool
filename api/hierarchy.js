const { getAllHierarchyData } = require('../server/services/hierarchyService')

module.exports = function handler(_req, res) {
  return res.json(getAllHierarchyData())
}
