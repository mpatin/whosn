var AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "Events";

var id = "b2";
var name = "Ultimate Frisbee";
var location = "Virginia War Carillon";
var time = "July 5th, 5:45pm";
var creator = "Mitch"

// var id = "a1";
// var name = "Basketball";
// var location = "Holman MS";
// var time = "July 7th, 5:45pm";
// var creator = "JJ"

var params = {
    TableName:table,
    Item:{
        "id": id,
        "name": name,
        "location": location,
        "date": date,
        "time": time,
        "creator": creator,
        "participants": [{
            "name": creator,
            "io": "in"
        }
      ]
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
