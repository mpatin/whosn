var AWS = require("aws-sdk");

AWS.config.update({
  region: "localhost",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var newResponse = {
  "name": "Shannon",
  "io": "out",
  "comments": "forgot clothes"
}

// var params = {
//   TableName: "Events",
//   Key: {
//     "id": "b2"
//   },
//   "UpdateExpression": "SET participants = list_append(participants, :newResponse)",
//   "ExpressionAttributeNames": {
//     "#attrName": "entries"
//   },
//   // "ExpressionAttributeValues": {
//   //   ":attrValue": ["000989"]
//   // }
// };

// var params = {
//     TableName: 'Events',
//     Key: {
//       "id": "b2"
//     },
//     ReturnValues: 'ALL_NEW',
//     UpdateExpression: 'set #participants = list_append(if_not_exists(#participants, :empty_list), :newResponse)',
//     ExpressionAttributeNames: {
//       '#participants': 'participants'
//     },
//     ExpressionAttributeValues: {
//       ':newResponse': [newResponse],
//       ':empty_list': []
//     }
//   }
var params = {
    TableName: 'Events',
    Key: {
      "id": "b2"
    },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #participants = list_append(#participants, :newResponse)',
    ExpressionAttributeNames: {
      '#participants': 'participants'
    },
    ExpressionAttributeValues: {
      ':newResponse': [newResponse]
    }
  }

console.log("Updating the item...");
docClient.update(params, function(err, data) {
  if (err) {
    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
  }
});
