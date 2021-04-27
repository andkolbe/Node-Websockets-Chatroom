Websockets with NodeJS and React

Two ways to do this:
In regards to the application server

Stateful
All users in the chatroom must be clustered in the same server
Create a unique chatroom id and hash it so that all users end up consistently on the same server
The act of making these requests are stateless but the routing will become stateful
Everything in the chatroom is stored on the server. No database needed
If the application loses power, the chatroom is lost forever 
The load balancer exists to ferry all users to the server with the chatroom on it
Easier to build, low latency, but no scalability

Stateless
State is stored in a database. Redis, MySQL, anything
The load balancer can create a chatroom in an available server. Use round robin instead of a hashing algo
This result is stored in the db
Any new users who want to join the chatroom can be led through the load balancer to any server to the db
If the application loses power, the chatroom is saved in the db
Periodically (maybe every 500ms), the servers will query the db for the latest state and then send it back through the load balancer to the users
Horizontally scales, harder to build, higher latency



The first request from the client to the server will send over the UPGRADE header to turn the HTTP connection into WebSocket
The first response from the server will be to uniquely identify the client. You want your clients to be identifiable with each request they make so you can look up
which connection to use on the server in order to communicate with that client. Use a hash table to store the unique client ids
Once your server looks up the client in the hash table, it responds with a payload
A client, once connected, can make a request to the server to make a new chatroom. This can be a JSON request that we can fill with any information we want
We'll create a key/value pair called "method": "create" and we'll have to send the client id as well
We can have to chatroom be stateful in memory of the server or save it in a Redis instance
The server will create a unique id for the chatroom and send it back the the user along with the create method
The client can choose to share this chatroom id with other clients who can then join the game
To request to join a game, a new client sends to the server JSON with a "method": "join", their client id, and the game id
The server responds to that client with the join method, the chatroom id, and all of the clients who are currently in the chatroom
The server will also send the same response to all of the clients who are already in the chatroom, saying that someone new has joined
When someone sends a message, they send a request to the server with "method": "message", their client id, the chatroom id, and the actual message
The server does not immediately send a response after each request. It waits, and after a number of miliseconds, will batch the states from each client
and send one response with all of these changes. "method": "update", game id, and a state of the current chatroom 
This is called the server authoritative model. The clients send inputs and the server groups the inputs and sends them back to the clients. The server is in charge
of the state of the chat room. 