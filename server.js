import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3000

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')))

// Serve the original JSON files
app.get('/scripts-v8/ghosts.json', (req, res) => {
  const filePath = join(__dirname, '..', 'scripts-v8', 'ghosts.json')
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

app.get('/scripts-v8/maps.json', (req, res) => {
  const filePath = join(__dirname, '..', 'scripts-v8', 'maps.json')
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

app.get('/scripts-v8/weekly.json', (req, res) => {
  const filePath = join(__dirname, '..', 'scripts-v8', 'weekly.json')
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

app.get('/feed-v8/feed.json', (req, res) => {
  const filePath = join(__dirname, '..', 'feed-v8', 'feed.json')
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 