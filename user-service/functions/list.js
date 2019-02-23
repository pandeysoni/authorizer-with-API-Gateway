'use strict';
const AWS = require('aws-sdk');
/** Get all apps and query for apps which have ACTIVE status */
module.exports.list = (event, context, callback) => {

  const db = new AWS.DynamoDB();

  const params = {
    TableName: process.env.TABLE_USERS
  };

db.scan(params, function(err, data) {
  if (err) {
    const response = {
        statusCode: err.statusCode || 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json "
        },
        body: JSON.stringify({
          message: err.message || 'Could not get app list'
        })
      };
      callback(null, response);
      return;
  } else {
    //console.log("Success", data.Items);
    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json "
        },
        body: JSON.stringify({
          Items: data.items
        })
      };
      callback(null, response);
      return;
  }
});
}


