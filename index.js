const app = require('express')(), 
	express = require('express'), 
	url = require('url'), 
	bParser = require('body-parser'), 
	apiHandler = require('./api'), 
	httpServer = require('http').Server(app), 
	io = require('socket.io')(httpServer)

let clients = new Set()

io.on('connection', (socket) => {
	clients.add(socket)

	for (client of clients){
		client.emit('change online', { onlineUsers: clients.size })
	}
	
	socket.on('client message', (msg) => {
		let messageTime = Date.now()
		for (client of clients){
			client.emit('chat message', { name: msg.name, text: msg.message, time: messageTime })
		}
	})

	socket.on('disconnect', () => {
		clients.delete(socket)
	})
})

setInterval(() => {
	for (client of clients){
		client.emit('chat message', { name: 'Server', text: 'Debug message from server', time: Date.now() })
	}
}, 1000)

app.use(bParser.json())

app.use((req, res, next)=>{
	console.log(req.url)
	next()
})

app.use('/api', apiHandler)

app.use(express.static(__dirname + '/public'))

httpServer.listen(3030, (err)=>{
	if(err)
		console.log(err)
	else
		console.log('ok')
})