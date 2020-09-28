const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const { MongoClient } = require('mongodb');

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://admin:admin@cluster0.u7ik8.mongodb.net/todo?retryWrites=true&w=majority";
 

    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        await  listDatabases(client);
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

main().catch(console.error);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/checklist', function (req, res) {
    fs.readFile('./todolist.json', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });
});

app.post('/updateTask', function (req, res) {
    console.log("Get Body", req.body);
    fs.readFile('./todolist.json', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var parsedData = JSON.parse(data);
            parsedData.todolist.forEach(element => {
                if (element.taskID === req.body.taskID) {
                    element.taskID = req.body.taskID;
                    element.taskDesc = req.body.taskDesc;
                    element.isDone = req.body.isDone;
                }
            });

            fs.writeFile("./todolist.json", JSON.stringify(parsedData, null, 2), (err) => {
                console.log(err);
            });

            res.sendStatus(200);
        }
    });
});

app.post('/addTask', function (req, res) {
    fs.readFile('./todolist.json', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var parsedData = JSON.parse(data);
            parsedData.todolist.push(req.body);

            fs.writeFile("./todolist.json", JSON.stringify(parsedData, null, 2), (err) => {
                console.log(err);
            });

            res.sendStatus(200);
        }
    });
});

app.delete('/deleteTask/:id', function (req, res) {
    fs.readFile('./todolist.json', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var parsedData = JSON.parse(data);
            parsedData.todolist.splice(
                parsedData.todolist.findIndex(ele => ele.taskID === req.params.id), 1);

            fs.writeFile("./todolist.json", JSON.stringify(parsedData, null, 2), (err) => {
                console.log(err);
            });

            res.sendStatus(200);
        }
    });
});

let server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});