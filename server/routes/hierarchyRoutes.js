const express = require('express')
const {
  getHierarchy,
  getHierarchyType,
  simulateLanguage,
} = require('../controllers/hierarchyController')

const router = express.Router()

router.get('/hierarchy', getHierarchy)
router.get('/type/:id', getHierarchyType)
router.post('/simulate', simulateLanguage)

module.exports = router
