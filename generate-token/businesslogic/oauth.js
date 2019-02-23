const AWS = require("aws-sdk");
const jwt = require('jsonwebtoken');
const tokenExpiry =  1 * 30 * 1000 * 60//1 hour
class Oauth {

  constructor() {
    this.db = new AWS.DynamoDB.DocumentClient();
  }

  getUser(emailId){
        let keyConditionExpression = "email = :emailId";
        let expressionAttributeValues = {
            ":emailId": emailId
        }
        let params = {
            TableName: process.env.TABLE_USERS,
            IndexName: process.env.INDEX_USER_EMAIL_GSI,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }
        return this.db.query(params).promise()
  }

  
  generateToken(userId, role, callback){
    console.log(userId)
    let tokenData = {
        userId: userId,
        scope: role
    }
    jwt.sign(tokenData, process.env.PRIVATE_TOKEN, { expiresIn:  tokenExpiry}, (err, token) => {
        console.log(err, token)
        callback(err, token)
    });
  }
}
module.exports = Oauth;