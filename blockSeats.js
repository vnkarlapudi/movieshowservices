
var dbConnection = require('./connection');
var executeRelease = require('./executeReleaseQuery.js');


module.exports = function(req, res) {
  var jsonString = '';
  var inString = '';
  var noOfSeats = 0;
console.log('test');
req.on('data', function (data) {
    jsonString += data;
});

req.on('end', function () {
  var obj = JSON.parse(jsonString);
  var keys = Object.keys(obj);
noOfSeats = keys.length;
if(noOfSeats<1){
  throw new Error('No Seats Selected');
}
  for (var i = 0; i < keys.length; i++) {
      if(inString!=''){
        inString = inString +',';
      }
      inString = inString + keys[i];
  }


  dbConnection.pool.getConnection(function(err, connection) {
      if (err) {
      connection.release();
         console.log(' Error getting pool connection: ' + err);
         throw err;
      }

      let sql2 = 'insert into app.transaction values();';
        connection.query(sql2, (err,result)=>{
      var txnId = result.insertId;
      var state = 'BLOCKED';
      var date = new Date();

      let sql = `update app.showseats set State = '${state}', trx_id = ${txnId}, stateChangeTime='${date.toISOString().replace(/T/, ' ').replace(/\..+/, '')}' WHERE show_seat_id in (${inString}) and State='EMPTY';`;

      connection.query(sql, (err,results)=>{

          var changedRows = results.changedRows;

          if(err) { connection.release();
                    throw err;
              }
          else if(changedRows<noOfSeats) {
                    console.log('One or More requested Seats are already Blocked');
                    var er = executeRelease(connection,txnId,res);
                    er.then(
                          (result)=>{connection.release();res.send(`{"txnId":"AlreadyBlocked"}`);},
                          (error)=>{connection.release();res.send("error");});
              }
          else{
              connection.release();
             function releaseSeats() {
              dbConnection.pool.getConnection(function(err, connection1) {
                  if (err) {
                      connection1.release();
                     console.log(' Error getting pool connection: ' + err);
                     throw err;
                  }
                  var er = executeRelease(connection1,txnId,res);
                  er.then(
                        (result)=>{connection1.release();},
                        (error)=>{connection1.release();});
            })

            }
            setTimeout(releaseSeats, 140000);
            res.send(`{"txnId":${txnId}}`);
          }
      })
    })
});
});


};
