import http from 'http'
import app from './app.mjs'
import env from 'dotenv'

env.config()

const PORT = process.env.PORT || 3000

const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})