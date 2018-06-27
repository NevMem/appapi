const fs = require('fs'), 
	bcrypt = require('bcrypt'), 
	mongodb = require('mongodb'), 
	mongoose = require('mongoose')
const MongoClient = mongodb.MongoClient
var ObjectID = mongodb.ObjectID

require('dotenv').config()

const db_url = process.env.db_url.replace('<dbuser>', process.env.user).replace('<dbpassword>', process.env.password)

var db = undefined
var ticketsCollection = undefined

MongoClient.connect(db_url, (err, client) => {
	if(err) console.log(err)
	else {
		console.log('connected to database')
		var maindb = client.db('maindb')
		ticketsCollection = maindb.collection('tickets')
		console.log('switched to tickets collection')

		ticketsCollection.find({ owner: 'NevMem' }).toArray((err, res) => {
			if(err) console.log(err)
			else{
				console.log(res)
			}
		})
	}
})

function addTicket(ticket){
	return new Promise((resolve, reject) => {
		if(validateTicket(ticket.number)){
			if(ticketsCollection != undefined){
				console.log('trying to add to databse'.cyan)
				ticketsCollection.insert({ owner: ticket.name, number: ticket.number, time: Date.now() }, ( err, res ) => {
					if(err){
						console.log('error ocured'.red)
						console.log(err)
						reject(err)
					} else {
						console.log('added'.green)
						console.log(res)
						resolve()
					}
				})
			} else {
				reject('Database unreachable'.red)
			}
		} else {
			console.log('Invalid ticket number'.yellow)
			reject('Invalid ticket number')
		}
	})
}

function runGenesis(){
	let genesis = "083366 019388 065423 105530 066025 066024 066023 058440 058441 019595 083628 010393 010394 010395 063572 063573 063574 074896 074895 074894 094438 084134 064831 064830 064829 074642 074643 074644 095911 035181 097410 097411 097412 060150 012639 065632 065633 065634 085445 089717 035717 035718 035719 026489 026490 026491 012865 060367"
	genesis = genesis.split(' ')
	for(let i = 0;i < genesis.length;i++){
		let number = genesis[i]
		addTicket({ number: number, name: 'NevMem' })
	}
}

function validateTicket(number){
    if(number.length !== 6)
		return false
    for (let i = 0;i < number.length;i++)
		if(!('0' <= number[i] && number[i] <= '9'))
			return false
    return true
}

exports.addTicket = addTicket
exports.changeTicketNumber = function(id, number, userName){
	return new Promise((resolve, reject) => {
		if(!validateTicket(number)){
			reject('Invalid ticket number')
			return
		}
		if (ticketsCollection) {
			ticketsCollection.update({ '_id': new ObjectID(id) }, {$set: { owner: userName, number: number }}, (err, res) => {
				if(err){
					console.log('rejecting'.red)
					reject(err)
				} else {
					console.log('resolving'.green)
					resolve()
				}
			})
		} else {
			reject('Database unreachable'.red)
		}
	})
}
exports.deleteTicket = function(id, userName){
	return new Promise((resolve, reject) => {
		if(ticketsCollection){
			console.log('Requesting to database'.cyan)
			ticketsCollection.remove({ _id: new ObjectID(id) }, (err, res) => {
				if(err){
					reject(err)
				} else {
					resolve()
				}
			})
		} else {
			console.log('Database unreachable'.red)
		}
	})
}
exports.getTickets = (startTime) => {
	return new Promise((resolve, reject) => {
		if(ticketsCollection){
			ticketsCollection.find({ time: { $gt: startTime }}).toArray((err, res) => {
				if(err){
					reject(err)
				} else {
					resolve(res)
				}
			})
		} else {
			reject('Database unreachable'.red)
		}
	})
}
exports.validateTicket = validateTicket