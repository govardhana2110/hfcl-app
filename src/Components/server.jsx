const { spawn } = require('child_process');
const os = require('os');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  path: '/terminal',
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  let term;
  if (os.platform() === 'win32') {
    term = spawn('cmd.exe');
  } else {
    term = spawn('bash');
  }

  socket.on('input', (data) => {
    term.stdin.write(`${data}\n`);
  });

  term.stdout.on('data', (data) => {
    socket.emit('output', data.toString());
  });

  term.stderr.on('data', (data) => {
    socket.emit('output', data.toString());
  });

});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});