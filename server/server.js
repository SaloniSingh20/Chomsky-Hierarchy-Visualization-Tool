const express = require('express')
const cors = require('cors')
require('dotenv').config()
const hierarchyRoutes = require('./routes/hierarchyRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('API running')
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Chomsky Hierarchy API is running' })
})

app.use('/api', hierarchyRoutes)

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on port ${process.env.PORT || 5000}`)
})
