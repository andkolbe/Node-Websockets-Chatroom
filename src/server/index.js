const express =  require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

// create a raw http server (this will help us create the TCP connection which will then pass to the websocket to do the job)
const http = require('http'); 
const httpServer = http.createServer();
const port = process.env.PORT || 8080;
httpServer.listen(port, () => console.log(`Server listening on port: ${port}`));

 // websocket server that allows us to perform the websockets handshake
const WebSocketServer = require('websocket').server; // .server keeps track of every connected client

// store a hash map of all of the clients and their connections
const clients = {};
// same with each new chat room that is created
const chatRoom = {};

// pass our http server into our websockets server
const wsServer = new WebSocketServer({ httpServer });

// if someone requests the websocket, go ahead and call this function
wsServer.on('request', request => {
    // connect
    const connection = request.accept(null, request.origin);
    // events that happen on the connection
    connection.on('open', () => console.log('Opened!'));
    connection.on('close', () => console.log('Closed!'));
    // what to do when our web socket server receives a message from a client
    connection.on('message', message => {

        // the utf8 data is the data the server will receive from the client
        // parse the JSON recevied from the client into something the server can understand
        const result = JSON.parse(message.utf8Data) // message is a JSON object, we want to receive the UTF 8 data

        console.log(`Received message: ${result}`);

        // create unique id for the client who just connected to us
        const clientId = uuidv4();
        // set the client ids in our clients hash map
        clients[clientId] = {
            'connection': connection
        }

        // send response back to the client
        const payload = {
            'method': 'connect',
            'clientId': clientId
        }
        connection.send(JSON.stringify(payload)) // server and client are talking through JSON

    }) 
})

app.use(express.json());
app.use(express.static('public'));
