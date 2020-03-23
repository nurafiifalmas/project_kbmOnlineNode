const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express()
const jwt = require('jsonwebtoken')

const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "db_pasien"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

//token
const isAuthorized = (request, result, next) => {

    if (typeof(request.headers['x-api-key']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = request.headers['x-api-key']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })

   
    next()
}

//login admin
app.post('/login/admin', (request, result) => {
    let data = request.body

    if (data.username == 'admin' && data.password == 'admin123') {
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

        result.json({
            success: true,
            message: 'Login success, welcome back Admin!',
            token: token
        })
    }

    result.json({
        success: false,
        message: 'You are not person with username admin and have password admin!'
    })
})

//read data pasien
app.get('/pasien', (req, res) => {
    let sql = `
        select * from pasien
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Data berhasil diambil dari database',
            data: result
        })
    })
})

//get (id)
app.get('/pasien/:id', (req, res) => {
    let sql = `
    select nama_pasien, alamat, usia, tanggal_masuk, penyakit, ruangan_pasien from pasien
    where pasien.id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Data berhasil diambil dari database sesuai id',
            data: result
        })
    })
})

//add data pasien
app.post('/pasien/tambah', isAuthorized, (req, result) => {
    data = req.body

    data.forEach(element => {
        
        db.query(`
        insert into pasien (nama_pasien, alamat, usia, tanggal_masuk, penyakit, ruangan_pasien)
        values ('`+element.nama_pasien+`', '`+element.alamat+`', '`+element.usia+`', '`+element.tanggal_masuk+`', '`+element.penyakit+`', '`+element.ruangan_pasien+`')
        `, 
        (err, result) => {
            if (err) throw err
        })
    });

    result.json({
        success: true,
        message: 'Data pasien berhasil ditambahkan'
    })
})

//update data pasien
app.put('/pasien/:id', isAuthorized, (req, result) => {
    let data = req.body

    let sql = `
        update pasien
        set nama_pasien = '`+data.nama_pasien+`', alamat = '`+data.alamat+`', usia = '`+data.usia+`', tanggal_masuk = '`+data.tanggal_masuk+`', 
        penyakit = '`+data.penyakit+`', ruangan_pasien = '`+data.ruangan_pasien+`'
        where id = `+req.params.id+`
   `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil diubah'
    })
})

//delete data pasien
app.delete('/pasien/:id', isAuthorized, (request, result) => {
    let sql = `
        delete from pasien where id = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil dihapus'
    })
})

// port untuk menjalankan program
app.listen(8020, () => {
    console.log('running on port 8020')
})