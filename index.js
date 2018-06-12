const express = require('express'), 
	url = require('url'), 
	bParser = require('body-parser'), 
	apiHandler = require('./api')

app = express()

app.use(bParser.json())

app.use((req, res, next)=>{
	console.log(req.url)
	next()
})

app.use('/api', apiHandler)

app.use(express.static(__dirname + '/public'))

app.listen(3030, (err)=>{
	if(err)
		console.log(err)
	else
		console.log('ok')
})