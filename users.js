const jwt = require('jsonwebtoken')

var data = [
	{ login: 'nevmem', password: '12345', email: 'memlolkek@gmail.com', name: 'NevMem' }
]

exports.getUser = function(login, password){
	for (let i = 0;i < data.length;i++){
		if(data[i].login === login && data[i].password === password)
			return { ...data[i], id: i }
	}
	return null
}

function validate(now){
	for (let user of data)
		if (user.login == now.login || user.name == now.name)
			return { err: true, message: 'not unique login or name' }
	if (now.password.length < 6)
		return { err: true, message: 'password too short' }
	return { err: false }
}

exports.getToken = function(userId, secret){
	return jwt.sign({ 
		login: data[userId].login, 
		name: data[userId].name, 
		accessId: userId
	}, secret)
}

exports.checkAccess = function(token, secret){
	try{
		let decoded = jwt.verify(token, secret)

		if(decoded.hasOwnProperty('accessId')){
			if(decoded.login === data[decoded.accessId].login)
				return { access: true, userName: data[decoded.accessId].name }
			return { access: false, msg: 'Permission denied' }
		} else {
			return { access: false, msg : 'Token is out dated try to relogin' }
		}
	} catch (err) {
		return { access: false, msg: 'User token is invalid try to relogin' }
	}
}

exports.registerUser = function(user){
	let res = {}
	res = validate(user)
	if(!res.err){
		data.push(user)
		res.id = data.length - 1
	}
	return res
}