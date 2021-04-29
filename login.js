const db = require('mysql');
const path = require('path');
const express = require('express');
const bp = require('body-parser');
const endcoder = bp.urlencoded({extended:false});
const app = express();

const conn = db.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database:'kasir'
});

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(bp.json());
app.use(bp.urlencoded({ extended: false}))

//connect to db
conn.connect(function(err){
    if(err)throw err
    else console.log("db connected")
});

//awalan masuk web
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html")
});

//login
app.post('/',endcoder,function(req,res){
    let nama = req.body.nama;
    let password = req.body.password;
    conn.query("select * from akun where nama = ? and password = ?",
    [nama, password],
    function(error,results,fields){
        if (results.length > 0) {
            if (nama == "admin" && password == "admin"){
                res.redirect('/admin_buku')
            }else{
            res.redirect("/user_buku");
            }
        } else {
            res.redirect('/');
        }
        res.end();
    })
});


//admin
//read db
app.get('/admin_buku',(req, res) => {
    let sql = "SELECT * FROM buku";
    let query = conn.query(sql, (err, rows)=>{
        if(err) throw err;
        res.render('admin_buku',{
            title: 'CRUD test',
            buku : rows 
        });
    });
});

//add value in db
app.get('/add',(req, res) => {
    res.render('admin_tambah_buku',{
        title: 'tambah buku',
    });
});

//save to add value
app.post('/save',(req,res)=>{
    let data = {nama_buku: req.body.nama_buku, harga: req.body.harga, stok: req.body.stok};
    let sql = "INSERT INTO buku SET ?";
    let query = conn.query(sql, data, (err, results)=>{
        if(err) throw err;
        res.redirect('/admin_buku');
    });
});

//edit value
app.get('/edit/:bukuId',(req,res)=>{
    const bukuId = req.params.bukuId;
    let sql = `Select * from buku where id_buku = ${bukuId}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.render('admin_edit_buku', {
            buku: result[0]
        });
    });
});

//update value that edited
app.post('/update',(req,res)=>{
    const bukuId = req.body.id_buku;
    let sql = "update buku SET nama_buku='"+req.body.nama_buku+"', harga='"+req.body.harga+"', stok='"+req.body.stok+"' where id_buku = "+bukuId;
    let query = conn.query(sql, (err, results)=>{
        if(err) throw err;
        res.redirect('/admin_buku');
    });
});

//delete value db
app.get('/delete/:bukuId',(req,res)=>{
    const bukuId = req.params.bukuId;
    let sql = `delete from buku where id_buku = ${bukuId}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.redirect('/admin_buku');
        
    });
});

//user
app.get('/user_buku',(req, res) => {
    let sql = "SELECT * FROM buku";
    let query = conn.query(sql, (err, rows)=>{
        if(err) throw err;
        res.render('user_buku',{
            title: 'CRUD test',
            buku : rows 
        });
    });
});

//beli buku
app.get('/beli/:bukuId',(req,res)=>{
    const bukuId = req.params.bukuId;
    let sql = `Select * from buku where id_buku = ${bukuId}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.render('transaksi', {
            buku: result[0]
        });
    });
});

app.post('/bayar',(req,res)=>{
    const bukuId = req.body.id_buku;
    const tanggal = Date.now;
    var setok = req.body.stok;
    console.log(setok);
    //var pengurangan = setok - 1;
    let sql = "update buku SET stok='"+setok+"' where id_buku = "+bukuId;
    let sql1 = "insert into transaksi SET id_buku='"+bukuId+"', tanggal='"+tanggal;
    let query = conn.query(sql, sql1, (err, results)=>{
        if(err) throw err;
        res.redirect('/user_buku');
    });
    
});

//run localhost
app.listen(5000, () => {
    console.log("server jalan");
});