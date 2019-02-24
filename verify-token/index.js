const jwt = require('jsonwebtoken');
const signingKey = "37LvDSm5XvjYOh9Y";
const BEARER_TOKEN_PATTERN = /^Bearer[ ]+([^ ]+)[ ]*$/i;

exports.handler = (event, context) => {
  console.log('Client token: ' + event.authorizationToken);
  console.log('Method ARN: ' + event.methodArn);
  let token = extract_access_token(event.authorizationToken);
  try {
    let decoded = jwt.verify(token, signingKey);
    if (decoded.role == "Admin") {
      let resource = methodArn.substring(0, methodArn.indexOf("/") + 1) + "*"
      let resourceList = ["arn:aws:execute-api:us-west-2:accountId:lwbctpkhk1/*"]
      let resouceIndex = resourceList.indexOf(resource)
      if (resouceIndex >= 0) {
        context.done(null, generatePolicy(decoded.email, 'Allow', event.methodArn, decoded))
      } else context.done(null, generatePolicy('user', 'Deny', methodArn));
    } else if (decoded.role == "User") {
      let resource = methodArn.substring(0, methodArn.indexOf("/") + 1) + "*"
      let resourceList = ["arn:aws:execute-api:us-west-2:accountId:s4kl2she14/*"]
      let resouceIndex = resourceList.indexOf(resource)
      if (resouceIndex >= 0) context.done(null, generatePolicy(decoded.email, 'Allow', event.methodArn, decoded))
      else context.done(null, generatePolicy('user', 'Deny', methodArn));
    } else context.done(null, generatePolicy('user', 'Deny', methodArn));
    
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