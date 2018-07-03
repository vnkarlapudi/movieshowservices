var dbConnection = require('./connection');
var executeRelease = require('./executeReleaseQuery.js');

module.exports = function(req, res) {
  var jsonString = '';
  var txnId = 0;

req.on('data', function (data) {
    jsonString += data;
});

req.on('end', function () {
  var obj = JSON.parse(jsonString);
  txnId = obj['txnId'];  
  dbConnection.pool.getConnection(function(err, connection) {
      var er = executeRelease(connection,txnId,res);
      er.then(
            (result)=>{connection.release();res.send("success");},
            (error)=>{connection.release();res.send("error");});

  });
  })
}
