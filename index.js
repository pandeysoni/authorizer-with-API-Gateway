const jwt = require('jsonwebtoken');
const signingKey = "37LvDSm4XvjYOh9Y";
const BEARER_TOKEN_PATTERN = /^Bearer[ ]+([^ ]+)[ ]*$/i;

exports.handler = (event, context) => {
  console.log('Client token: ' + event.authorizationToken);
  console.log('Method ARN: ' + event.methodArn);
  let token = extract_access_token(event.authorizationToken);
  try {
    let decoded = jwt.verify(token, signingKey);
    context.done(null, generatePolicy(decoded.userId, 'Allow', event.methodArn, decoded));
  } catch(ex) {
    console.error(ex.name + ": " + ex.message);
    context.done(null, generatePolicy('user', 'Deny', event.methodArn));
  }
};

const generatePolicy = (principalId, effect, resource, decoded) => {
    let authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    if(decoded) authResponse.context = decoded;
    return authResponse;
};

const extract_access_token = (authorization) => {
  if (!authorization)
  {
    return null;
  }
  let result = BEARER_TOKEN_PATTERN.exec(authorization);
  if (!result)
  {
    return null;
  }
  return result[1];
};