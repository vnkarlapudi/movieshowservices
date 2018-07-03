const express = require('express');
const mysql = require('mysql');


var pool = mysql.createPool({
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'mysql'
});

const db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'mysql',
  multipleStatements: true
});

db.connect((err)=>{
    if(err){
      throw err;
    }
    console.log('mysql connected');
});



module.exports.db = db;
module.exports.pool = pool;
