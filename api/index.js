const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());

const activeConnections = {};
const savedCoordinates = [];

app.ws('/draw', function (ws, req) {
    const id = nanoid();
    console.log('client connected! id=', id);
    activeConnections[id] = ws;

    ws.send(JSON.stringify({
        type: 'PREV_PIXELS',
        coordinates: savedCoordinates,
    }));

    ws.on('close', (msg) => {
        console.log('Client disconnected! id=', id);
        delete activeConnections[id];
    });

    ws.on('message', (msg) => {
        const decodedMessage = JSON.parse(msg);
        switch (decodedMessage.type) {
            case 'SEND_PIXEL':
                Object.keys(activeConnections).forEach(connId => {
                    const conn = activeConnections[connId];
                    savedCoordinates.push(decodedMessage.coordinates)
                    conn.send(JSON.stringify({
                        type: 'NEW_PIXEL',
                        message: {
                            text: decodedMessage.coordinates
                        }
                    }));
                });
                break;
            default:
                console.log('Unknown message type:', decodedMessage.type);
        }
    });
});

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});