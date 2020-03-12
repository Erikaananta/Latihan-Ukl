const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

const app = express()

const secretKey = 'thisisverysecretKey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'transaksi_sewa'
})

db.connect((err) => {
    if (err) throw err
    console.log('Dadtabase Connected...')
})

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

app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'welcome!!!!!'
    })
})

app.post('/login', (request, result) => {
    let data = request.body

    if (data.username == 'erika' && data.password == 'erika') {
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

app.get('/barang', (req, res) => {
    let sql = `
        select * from barang
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        res.json({
            success: true,
            message: "Success get data from barang",
            data: result
        })
    })
})

app.post('/barang', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        insert into barang (nama_barang, stock)
        values ('`+ data.nama_barang + `', + '` + data.stock + `')
    `
    db.query(sql, (err, result) => {
        if (err) throw err
    })
    result.json({
        success: true,
        message: 'Youre new file is ready'
    })
})

app.put('/barang:/id', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        update barang 
        set nama_barang = '`+ data.nama_barang + `', stock = '` + stock + `'
        where id = '`+ request.params.id + `'
    `
    db.query(sql, (err, result) => {
        if (err) throw err
    })
    result.json({
        success: true,
        message: 'Youre file is ready updated'
    })
})

app.delete('/barang/:id', isAuthorized, (request, result) => {
    let sql = `
        delete from barang where id = '`+ request.params.id + `'
    `
    db.query(sql, (err, result) => {
        if (err) throw err
    })
    result.json({
        success: true,
        message: 'Youre file is deleted'
    })

})

// TRANSAKSI

app.post('/barang/:id/take', (req, res) => {
    let data = req.body

    db.query(`
        insert into transaksi (id_user, id_barang)
        values ('`+ data.id_user + `', '` + req.params.id + `')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update barang
        set stock = stock - 1
        where id = '`+ req.params.id + `'
    `, (err, result) => {
        if (err) throw err
    })
    res.json({
        message: "success get user barang",
        data: result
    })
})

app.post('/barang_kembali/:id/back', (req, res) => {
    let data = req.body

    db.query(`
        insert into transaksi (id_user, id_barang)
        values ('`+ req.params.id + `', '` + data.id_barang + `')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update barang
        set stock = stock + 1
        where id = '`+ req.params.id + `'
    `, (err, result) => {
        if (err) throw err
    })
    res.json({
        message: "success back user barang",
        data: result
    })
})

app.listen(3000, () => {
    console.log('App is running on port 3000')
})




