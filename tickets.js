const fs = require('fs'), 
	bcrypt = require('bcrypt')
let tickets = []
let nextId = 0

const maxCount = 10

function load(){
	tickets = JSON.parse(fs.readFileSync('tickets.json'), 'utf-8')
	for (let i = 0;i < tickets.length;i++){
		let ID = parseInt(tickets[i].id)
		if(!isNaN(ID))
			nextId = Math.max(ID, nextId)
	}
	nextId += 1

	if(tickets.length == 0)
		runGenesis()

	console.log('count of tickets:', tickets.length)
}

function addTicket(ticket){
	return new Promise((resolve, reject) => {
		if(validateTicket(ticket.number)){
			tickets.push({ id: nextId, name: ticket.name, number: ticket.number })
			nextId += 1
			save()
			resolve()
		} else {
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

function save(){
	fs.writeFileSync('tickets.json', JSON.stringify(tickets), 'utf-8')
}

load()

function validateTicket(number){
    if(number.length !== 6)
		return false
    for (let i = 0;i < number.length;i++)
		if(!('0' <= number[i] && number[i] <= '9'))
			return false
    return true
}

exports.getLast = function(id){
	let toSend = []
	if(id == -1){
		/*for (let i = 0;i < Math.min(tickets.length, maxCount);i++){
			toSend.push(tickets[i])
		}*/
		for(let i = Math.max(0, tickets.length - maxCount); i < tickets.length;i++){
			toSend.push(tickets[i])
		}
	} else {
		let pos = -1
		for(let i = 0;i < tickets.length;i++){
			if(tickets[i].id == id)
				pos = i + 1
		}
		if(pos != -1){
			for (let i = pos;i <= Math.min(tickets.length - 1, pos + maxCount - 1);i++)
				toSend.push(tickets[i])
		}
	}
	return toSend
}
exports.addTicket = addTicket
exports.changeTicketNumber = function(id, number, userName){
	return new Promise((resolve, reject) => {
		if(!validateTicket(number)){
			reject('Invalid ticket number')
			return
		}
		for(let i = 0;i < tickets.length;i++){
			if(tickets[i].id === id){
				if(tickets[i].name !== userName){
					reject('You are not ticket owner')
					return
				}

				tickets[i].number = number
				save()
				resolve()
				return
			}
		}
		reject('Ticket not found')
	})
}
exports.deleteTicket = function(id, userName){
	return new Promise((resolve, reject) => {
		let upd = []
		for (let i = 0;i < tickets.length;i++){
			if(tickets[i].id == id && tickets[i].name !== userName){
				reject('You are not ticket owner')
				return
			}
			if(tickets[i].id != id)
				upd.push(tickets[i])
		}
		tickets = upd
		save()	
		resolve()
	})
}
exports.validateTicket = validateTicket