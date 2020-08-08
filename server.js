const express = require('express');

const app = express();
const httpServer = require('http').Server(app);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(httpServer);

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    });
  });
});

httpServer.listen(3030);
