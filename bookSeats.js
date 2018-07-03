var dbConnection = require('./connection');


module.exports = function(req, res) {
  var jsonString = '';
  var noOfSeats = 0;
  var txnId = 0;

req.on('data', function (data) {
    jsonString += data;
});

req.on('end', function () {
  var obj = JSON.parse(jsonString);
    noOfSeats = obj['noOfSeats'];
      txnId = obj['txnId'];


  var state = 'BOOKED';
  var date = new Date();
  let sql = `update app.showseats set State = '${state}', stateChangeTime='${date.toISOString().replace(/T/, ' ').replace(/\..+/, '')}' WHERE trx_id = ${txnId} and State='BLOCKED';`;

  dbConnection.pool.getConnection(function(err, connection) {
        if (err) {
        connection.release();
           console.log(' Error getting pool connection: ' + err);
           throw err;
        }    
        connection.query(sql, (err,results)=>{
        var changedRows = results.changedRows;
        if(err) {
                connection.release();
                throw err;
          }
        else if(changedRows!=noOfSeats) {
                  connection.release();
                throw new Error('Time Out');
          }
        else{
            connection.release();
             res.send('success');
        }
  })
})

})
}
