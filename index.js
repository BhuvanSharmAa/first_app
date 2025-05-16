const path = require('path')
const dotenv = require('dotenv')

// Force load the .env file
const result = dotenv.config({ override: true })

if (result.error) {
    console.error('Error loading .env file:', result.error)
    process.exit(1)
}

console.log('PORT from .env:', process.env.PORT)

const express = require('express')
const app = express()
const port = process.env.PORT || 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})