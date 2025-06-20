// app.js

const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

const userSocketMap = new Map(); // Maps user IDs to socket IDs

io.on("connection", (socket) => {
    // Event to associate a user ID with the current socket ID
    socket.on('registerUser', ({ userId }) => {
        userSocketMap.set(userId, socket.id);
    });

    // Listen for 'typing' event from the client
    socket.on('typing', (data) => {
        const recipientSocketId = userSocketMap.get(data.recipientId);
        if (recipientSocketId) {
            socket.to(recipientSocketId).emit('typing', data);
        }
    });


     // Handle stopTyping event
     socket.on('stopTyping', (data) => {
        const recipientSocketId = userSocketMap.get(data.recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('stopTyping', data);
        }
    });
    // Listen for a 'sendMessageToUser' event from clients
    socket.on("sendMessageToUser", ({ recipientId, msg, senderId }) => {
        // console.log(`Received message from ${senderId} to ${recipientId}: ${msg}`);
        const recipientSocketId = userSocketMap.get(recipientId);
        if (recipientSocketId) {
            const data = {
                message: msg,
                recipientId: recipientId,
                recipientSocketId: recipientSocketId,
                senderId: senderId
            }
            io.to(recipientSocketId).emit('receiveMessage', data,);

        } else {
            console.log(`Recipient ${recipientId} not found.`);
        }
    });

    socket.on("disconnect", () => {
        // Remove the user from the map on disconnect
        const entries = userSocketMap.entries();
        for (let [userId, socketId] of entries) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

module.exports = { app, io, server };
