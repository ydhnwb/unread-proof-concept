const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

const { comments: c } = require('./datas')
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}))
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const port = 3001


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

    socket.on('setSeenArray', (msg) => {
        console.log('message array of ids', msg)
        const ids = JSON.parse(msg)
        console.log(ids)
        ids.forEach(element => {
            const itemIdx = comments.findIndex((c) => c._id == element._id)
            if (itemIdx != -1) {
                const seenBy = comments[itemIdx].seenBy != undefined ? comments[itemIdx].seenBy : []
                seenBy.push(userId)
                Object.assign(comments[itemIdx], { seenBy })
            }

        });

        io.emit('update', 'there is data changes on comments.');
    })
});


server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
