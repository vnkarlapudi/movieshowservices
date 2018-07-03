
module.exports = function(connection, txnId) {

  var state = 'EMPTY';
  var date = new Date();
  let sql = `update app.showseats set State = '${state}', stateChangeTime='${date.toISOString().replace(/T/, ' ').replace(/\..+/, '')}' WHERE trx_id = ${txnId} and State='BLOCKED';`;

 return new Promise(function(resolve,reject){
  connection.query(sql, (err,results)=>{

      if(err) {
     reject('error');
          }
      else{
         resolve('success');
      }
  })
})

}
