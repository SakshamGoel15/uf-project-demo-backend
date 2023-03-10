const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5001

// const connection = mysql.createConnection({
//   host: '127.0.0.1',
//   user: 'root',
//   password: '',
//   database: 'UF_PROJECT_DEMO',
//   port: 3306
// })
const connection = mysql.createPool({
  host: 'us-cdbr-east-06.cleardb.net',
  user: 'b054bc19623fdd',
  password: '312dac91',
  database: 'heroku_432fe4c4ed13304'
})


// connection.connect()

app.use(cors({ origin: '*' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/crash-events', (req, res) => {
  connection.query('SELECT * from CRASH_EVENT', (err, rows, fields) => {
    if (err) throw err
    res.json(rows)
  })
})

app.get('/vehicle-details', (req, res) => {
  connection.query('SELECT * from VEHICLE', (err, rows, fields) => {
    if (err) throw err
    res.json(rows)
  })
})

app.get('/driver-details', (req, res) => {
  connection.query('SELECT * from DRIVER', (err, rows, fields) => {
    if (err) throw err
    res.json(rows)
  })
})

app.get('/crash-events/:reportNumber', (req, res) => {
  const reportNumber = req.params.reportNumber;
  connection.query(`SELECT VEHICLE.* from CRASH_EVENT JOIN VEHICLE ON CRASH_EVENT.REPORT_NUMBER = VEHICLE.REPORT_NUMBER WHERE CRASH_EVENT.REPORT_NUMBER = ${reportNumber}`, (err, rows, fields) => {
    if (err) throw err
    connection.query(`SELECT * from DRIVER where VEHICLE_NUMBER in (${rows.map(_row=>_row.VEHICLE_NUMBER)}) AND REPORT_NUMBER = ${reportNumber}`, (err2, rows2, fields2) => {
      if (err2) throw err2
      connection.query(`SELECT * from CRASH_EVENT where REPORT_NUMBER = ${reportNumber}`, (err3, rows3, fields3) => {
        if (err3) throw err3
        res.json({vehicles: rows, drivers: rows2, reportNumber, crashEvent: rows3[0]})
      })
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})