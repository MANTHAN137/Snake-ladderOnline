const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// --- Game Configuration & State ---
const snakes = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};
const ladders = {
    1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

// Game State
let players = [
    { id: 0, pos: 1, name: 'Red', color: '#ff4757', socketId: null },
    { id: 1, pos: 1, name: 'Green', color: '#2ed573', socketId: null },
    { id: 2, pos: 1, name: 'Blue', color: '#1e90ff', socketId: null },
    { id: 3, pos: 1, name: 'Yellow', color: '#ffa502', socketId: null }
];
let currentTurn = 0;
let consecutiveSixes = 0;
let turnStartPos = 1;
let connectedCount = 0;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Assign player slot
    let playerIndex = -1;
    for (let i = 0; i < players.length; i++) {
        if (players[i].socketId === null) {
            players[i].socketId = socket.id;
            playerIndex = i;
            break;
        }
    }

    if (playerIndex === -1) {
        socket.emit('roomFull');
        return; // Spectator ideally, but for now just ignore
    }

    connectedCount++;

    // Tell client who they are and current state
    socket.emit('init', {
        myIndex: playerIndex,
        players: players,
        currentTurn: currentTurn
    });

    // Broadcast updated player list
    io.emit('playerUpdate', players);

    // Handle Dice Roll Request
    socket.on('requestRoll', async () => {
        if (currentTurn !== playerIndex) return; // Not your turn

        // Valid turn logic
        const player = players[currentTurn];

        // Mark start pos if fresh turn
        if (consecutiveSixes === 0) {
            turnStartPos = player.pos;
        }

        // Logic: Roll Logic server-side
        const rollVal = Math.ceil(Math.random() * 6);

        // Emit roll event immediately so clients can animate
        io.emit('diceRolled', { val: rollVal, playerIdx: currentTurn });

        // Wait a bit for animation to finish on clients (simulated)
        // In real-time apps, we usually send the result and let client animate, 
        // but here we process logic *after* a delay or send 'result' immediately and client delays application.
        // Let's send the *Move Result* immediately, client handles timing.

        let message = "";
        let nextTurn = currentTurn;
        let pPos = player.pos;

        // 1. Three 6s Rule
        if (rollVal === 6) {
            consecutiveSixes++;
            if (consecutiveSixes === 3) {
                message = "Three 6s! Void!";
                pPos = turnStartPos; // Reset
                consecutiveSixes = 0;
                nextTurn = (currentTurn + 1) % 4; // Pass turn

                io.emit('turnResult', {
                    playerIdx: currentTurn,
                    newPos: pPos,
                    message: message,
                    nextTurn: nextTurn,
                    voidTurn: true
                });
                currentTurn = nextTurn;
                return;
            }
        } else {
            consecutiveSixes = 0;
        }

        // 2. Move Logic
        if (pPos + rollVal <= 100) {
            pPos += rollVal;

            // 3. Snakes/Ladders logic?
            // Note: In original code, we waited for animation.
            // Server just calculates final destination.
            // But we want client to show "oh snake!".
            // We can send intermediate updates or just final. 
            // Let's send "landed" event then specific "snake" event?
            // Simplest: Send final position, let client infer movement. 
            // OR checks locally on client for animation but server is authority.

            // Check Snake
            if (snakes[pPos]) {
                pPos = snakes[pPos];
                message = "Snake!";
            } else if (ladders[pPos]) {
                pPos = ladders[pPos];
                message = "Ladder!";
            }
        } else {
            message = "Too high! Stay.";
            // pPos stays same
        }

        // Update Server State
        players[currentTurn].pos = pPos;

        // Win Check
        let winner = null;
        if (pPos === 100) {
            winner = playerIndex;
            message = "WINNER!";
            // Reset game?
        }

        // Decide next turn
        if (rollVal !== 6 && !winner) {
            nextTurn = (currentTurn + 1) % 4;
        } else if (!winner) {
            message += " Roll again!";
            // nextTurn stays currentTurn
        }

        currentTurn = nextTurn;

        // Emit final outcome
        io.emit('turnResult', {
            playerIdx: playerIndex,
            newPos: pPos,
            message: message,
            nextTurn: nextTurn,
            rollVal: rollVal,
            winner: winner
        });

    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (playerIndex !== -1) {
            players[playerIndex].socketId = null;
            // Optionally reset their position or kick them? 
            // Keep pos for reconnection logic (simple version: slot frees up)
            io.emit('playerUpdate', players);
        }
    });

    // Reset Game
    socket.on('resetGame', () => {
        players.forEach(p => p.pos = 1);
        currentTurn = 0;
        consecutiveSixes = 0;
        io.emit('gameReset', players);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
