var router = require('express').Router(), 
	tickets = require('./tickets'), 
	jwt = require('jsonwebtoken'), 
	users = require('./users'), 
	colors = require('colors')

const secret = 'secret'

router.use((req, res, next) => {
	if(req.body){
		let token = req.body.token
		if(token){
			jwt.verify(token, secret, (err, data) => {
				if(!err){
					console.log(data)
				} else {	
					console.log('Invalid token'.red)
					console.log(token)
				}
			})
		}
	}
	next()
})

router.post('/tickets', (req, res) => {
	tickets.getTickets(parseInt(req.body.startTime)).then(data => res.send(data)).catch(err => {
		res.send(err)
	})
})

router.post('/addTicket', (req, res) => {
	let token = req.body.token
	let number = req.body.number
	let name = req.body.name

	tickets.addTicket({ number: number, name: name })
		.then(() => res.send({ message: 'added' }))
		.catch(msg => {
			res.send({ err: msg })
		})
})
router.post('/deleteTicket', (req, res) => {
	let id = req.body.id, token = req.body.token

	if(!token){
		res.send({ err: 'Token is invalid' })
		return 
	}

	let access = users.checkAccess(token, secret)

	if(access.access === true){
		tickets.deleteTicket(id, access.userName)
			.then(() => res.send({}))
			.catch(err => res.send({ err: err }))
	} else {
		res.send({ err: access.msg })
	}
})
router.post('/changeTicketNumber', (req, res) => {
	let id = req.body.id, number = req.body.number, token = req.body.token

	if(!token){
		res.send({ err: 'Token is invalid' })
		return
	}

	let access = users.checkAccess(token, secret)

	if(access.access === true){
		tickets.changeTicketNumber(id, number, access.userName)
			.then(() => res.send({}))
			.catch(err => {
				console.log('error', err)
				res.send({ err: err })
			})
	} else {
		res.send({ err: access.msg })
	}
})

router.post('/login', (req, res) => {
	let data = req.body
	let login = data.login
	let password = data.password
	let user = users.getUser(login, password)
	if(user){
		res.status(200).send({ err: false, user: { name: user.name, email: user.email, token: users.getToken(user.id, secret) } })
	} else {
		res.status(401).send({ err: true, message: 'error while signing in' })
	}
})

router.post('/register', (req, res) => {
	let data = req.body
	if(data.name && data.login && data.email && data.password) {
		let out = users.registerUser({ login: data.login, name: data.name, email: data.email, password: data.password })
		if(out.err){
			res.status(200).send({ err: true, message: out.message })
		} else {
			res.status(200).send({ err: false, user: { name: data.name, email: data.email, token: users.getToken(out.id, secret) } })
		}
	} else {
		res.status(200).send({ err: true, message: 'one or more fields are empty' })
	}
})

module.exports = router