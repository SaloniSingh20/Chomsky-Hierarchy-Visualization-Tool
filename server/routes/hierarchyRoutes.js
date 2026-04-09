const express = require('express')
const {
  getHierarchy,
  getExplore,
  getHierarchyType,
  classifyGrammarController,
  simulateLanguage,
} = require('../controllers/hierarchyController')

const router = express.Router()

router.get('/hierarchy', getHierarchy)
router.get('/explore-content', getExplore)
router.get('/type/:id', getHierarchyType)
router.post('/simulate', simulateLanguage)
router.post('/classify', classifyGrammarController)

module.exports = router
