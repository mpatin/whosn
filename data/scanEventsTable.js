var AWS = require("aws-sdk");

AWS.config.update({
    region: "localhost",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "Events",
};

console.log("Scanning Events table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // add all the Events
        console.log("Scan succeeded.");
        var events = [];
        data.Items.forEach(function(event) {
          //console.log(event);
          events.push(event);
        });
        console.log(events);

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        // if (typeof data.LastEvaluatedKey != "undefined") {
        //     console.log("Scanning for more...");
        //     params.ExclusiveStartKey = data.LastEvaluatedKey;
        //     docClient.scan(params, onScan);
        // }
    }
}
