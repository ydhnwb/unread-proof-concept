const { comments: c } = require('./datas')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000


//database mock
let comments = c



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/get-comments', (req, res) => {
    res.send(comments)
})

io.on('connect', (socket) => {
    const userId = socket.handshake.query["userId"]
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('[BE]: user disconnected');
    });

    socket.on('setSeen', (msg) => {
        console.log('message: ' + msg + ' with userId' + socket.handshake.query['userId']);
        const itemIdx = comments.findIndex((c) => c._id == msg)
        console.log(itemIdx)
        if (itemIdx != -1) {
            const seenBy = comments[itemIdx].seenBy != undefined ? comments[itemIdx].seenBy : []
            seenBy.push(userId)
            Object.assign(comments[itemIdx], { seenBy })
        }

    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
