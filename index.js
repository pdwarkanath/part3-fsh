const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
require('dotenv').config()

morgan.token('req', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req'))

let persons = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person=>{
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        response.status(500).end()
    })
})

app.get('/info', (request, response) => {
    const count = persons.length
    const d = new Date()
    response.send(
    `<p>Phonebook has info for ${count} people</p>
    <p>${d.toString()}</p>`
    )
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    let id = Math.floor(Math.random()*100)
    while (persons.find(p=>p.id === id)){
        id = Math.floor(Math.random()*100)
    }
    return id
}

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons',(request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    } else if (persons.find(p=>p.name===body.name)){
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
            error: 'name missing' 
        })
    }

    const person = new Person({
        id: generateId(),
        name: body.name, 
        number: body.number
    })
    person.save().then(savedPerson => response.json(savedPerson))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})