const express = require('express')
const server = require('http').createServer()
const app = express()

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)

server.listen(3000, function () {
  console.log('Server is running on port 3000')
})

process.on('SIGINT', function () {
  console.log('sigint')
  wss.clients.forEach(function each(client) {
    client.close()
  })
  server.close(() => {
    shutdownDb()
  })
})

/** Begin Websocket */

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ server })

const numClients = () => wss.clients.size

wss.on('connection', function connection(ws) {
  console.log('Number of connected clients: ', numClients())

  wss.broadcast(`Current visitors: ${numClients()}`)

  if (ws.readyState === ws.OPEN) {
    ws.send(`Welcome to my server!`)
  }

  db.run(`
    INSERT INTO visitors (count, time)
        VALUES (${numClients()}, datetime('now'))
    `)

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${numClients()}`)
    console.log('A client has disconnected')
  })
})

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}

/** End Websocket */

/** Begin Database */

const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database(':memory:')

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
            count INTEGER,
            time TEXT
        )
    `)
})

function getCounts() {
  db.each(`SELECT * FROM visitors`, (err, row) => {
    if (err) {
      console.error(err)
    } else {
      console.log(row)
    }
  })
}
function shutdownDb() {
  getCounts()
  console.log('Shutting down db...')
  db.close()
}

/** End Database */
