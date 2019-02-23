const GoogleAuth = require('google-auth-library');
const auth = new GoogleAuth;
const clientId = 'clientid';
const clientSecret = 'clientSecret';
const client = new auth.OAuth2(clientId, clientSecret, '');
const Oauth = require('../businesslogic/oauth');
const async = require('async');

exports.oauth = (event, context, callback) => {
    async.waterfall([
        (callback) => {
            client.verifyIdToken(
                JSON.parse(event.body).token,
                clientId,
                (e, login) => {
                    console.log(e, login)
                    if(e){
                        callback(e, null);
                    }
                    else{
                        let payload = login.getPayload();
                        callback(null, payload);
                    }
            });
        },
        (payloadData, callback) => {
            let oauth = new Oauth();
            oauth.getUser(payloadData['email'])
                    .then(data => {
                        if(data.Items.length > 0) callback(null, data.Items[0]);
                        else callback('Invalid User', null)
                    })
                    .catch(err => {
                        callback(err, null);
                    })
        },
        (user, callback) => {
            let oauth = new Oauth();
            oauth.generateToken(user.userId, user.districtId, user.role, (err, result) => {
                callback(err,result)
            })       
        }
    ], (err, result) {
        console.log("err", err, result)
        if(err){
             const response = {
                    statusCode: 500,
                    headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json "
                    },
                    body: JSON.stringify({
                    message: 'Invalid Login',
                    stack: err
                    })
                };
                callback(null, response);
                return;
        }
        else{
            const response = {
                statusCode: 200,
                headers: {
                "Access-Control-Allow-Origin" : "*",
                "Content-Type": "application/json "
                },
                body: JSON.stringify({accessToken:result})
            };
            callback(null, response);
            return;
        }
    })   
}