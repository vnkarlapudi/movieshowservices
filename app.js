const express = require('express');
var cors = require('cors');

var dbConnection = require('./connection');

const app = express();
app.use(cors());
app.listen('6001', ()=> {
  console.log('Server started on port 6000');
});

app.get('/movies/:onDate', (req,res)=>{
  let sql = `select m.* from app.movies m where exists(select sh.movie_id from app.shows sh where m.movie_id = sh.movie_id and DATE(sh.show_time) = STR_TO_DATE('${req.params.onDate}','%Y-%m-%d'))`;
  console.log(sql);
  dbConnection.pool.getConnection(function(err, connection) {
      if (err) {
      connection.release();
         console.log(' Error getting pool connection: ' + err);
         throw err;
      }
  connection.query(sql, (err,result)=>{
      if(err) {connection.release(); throw err;}
      connection.release();
      res.json(result);
  })
})
})


app.get('/getShows/:id/:onDate', (req,res)=>{
  let sql = `select sh.show_id, sh.theater_id, th.name theater_name, sh.movie_id, sh.show_time from app.shows sh, app.theater th where sh.theater_id = th.theater_id and sh.movie_id = ${req.params.id} and DATE(sh.show_time) = STR_TO_DATE('${req.params.onDate}','%Y-%m-%d')`;
  dbConnection.pool.getConnection(function(err, connection) {
      if (err) {
      connection.release();
         console.log(' Error getting pool connection: ' + err);
         throw err;
      }
  connection.query(sql, (err,result)=>{
    if(err) {connection.release(); throw err;}
    connection.release();
    res.json(result);
  })
})
})

app.get('/getTxnSeats/:id', (req,res)=>{
  let sql = `select trx.transaction_id, m.movie_name, t.name, s.show_time, ss.Rowseq, ss.RowName, ss.column_number  from app.transaction trx, app.showseats ss, app.shows s, app.movies m, app.theater t where trx.transaction_id = ss.trx_id and ss.state = 'BLOCKED' and ss.show_id = s.show_id and s.theater_id = t.theater_id and s.movie_id = m.movie_id and trx.transaction_id = ${req.params.id} order by Rowseq asc, column_number asc`;
  dbConnection.pool.getConnection(function(err, connection) {
      if (err) {
      connection.release();
         console.log(' Error getting pool connection: ' + err);
         throw err;
      }
  connection.query(sql, (err,result)=>{
    if(err) {connection.release(); throw err;}
    connection.release();
    res.json(result);
  })
})
})

app.get('/getShowSeats/:id', (req,res)=>{
  let sql = `select ss.show_seat_id, mov.movie_name, mov.movie_id, shows.show_id, shows.show_time, th.theater_id, th.name, ss.Rowseq,ss.RowName, ss.column_number,ss.state, ss.stateChangeTime from app.movies mov, app.shows shows, app.theater th, app.showseats ss where shows.movie_id = mov.movie_id and ss.show_id = shows.show_id and shows.theater_id = th.theater_id and ss.show_id = ${req.params.id}`;
  dbConnection.pool.getConnection(function(err, connection) {
      if (err) {
      connection.release();
         console.log(' Error getting pool connection: ' + err);
         throw err;
      }
  connection.query(sql, (err,result)=>{
      if(err) throw err;
      res.json(result);
  })
})
})

//service to block show seats
app.patch('/blockShowSeats', (req,res)=>{
    require('./blockSeats')(req, res);
})


//service to confirm show seats after successful payment
app.patch('/bookShowSeats', (req,res)=>{
     require('./bookSeats')(req, res);
})

//service to release show seats after timeout/cancel txn
app.patch('/releaseShowSeats', (req,res)=>{
     require('./releaseSeats')(req, res);
})
