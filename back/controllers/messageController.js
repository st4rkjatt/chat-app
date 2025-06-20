const ConversationModel = require("../model/conversationModel");
const mongoose = require('mongoose');
const MessageModel = require('../model/messageModel');
const UserModel = require("../model/userModels");
const rabbitMQ = require("../services/rabbitMq");
const { v4: uuidv4 } = require("uuid");

// const sendMessage = async (req, res, next) => {
//     try {
//         const { message } = req.body;

//         const senderId = req.userId;
//         const receiverId = req.params.id;

//         // console.log(senderId, message, receiverId, '?')
//         let conversation = await ConversationModel.findOne({
//             participants: { $all: [senderId, receiverId] }
//         });

//         if (!conversation) {
//             conversation = await ConversationModel.create({
//                 participants: [senderId, receiverId],
//             });
//         }

//         const newMessage = new MessageModel({
//             senderId,
//             receiverId,
//             message
//         });

//         conversation.messages.push(newMessage._id);

//         console.log(conversation,"conversation")
//         await Promise.all([conversation.save(), newMessage.save()]);
//         res.status(200).json({
//             status: true,
//             message: message
//         });
//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// }
const sendMessage = async (req, res, next) => {
    try {
        console.log('send message API')
        const { message } = req.body;
        const senderId = req.userId;
        const receiverId = req.params.id;
        if (!message) {
            return res.status(400).json({
                status: false,
                message: 'Message is required.'
            })
        }
        if (!senderId || !receiverId) {
            return res.status(400).json({
                status: false,
                message: 'Sender and receiver are required.'
            })
        }
        // console.log(message, receiverId, "???")
        const isExits = await ConversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        })
        // console.log(isExits, "exits")


        // check first both user exits in user table or not 
        // const sender = await UserModel.findById(senderId);
        // const receiver = await UserModel.findById(receiverId);

        // Send request to user service
        // ✅ Create a temporary exclusive queue for the reply
        const channel = await rabbitMQ();
        const { queue } = await channel.assertQueue("", { exclusive: true });
        const correlationId1 = uuidv4();

        channel.sendToQueue(
            "user_find_queue",
            Buffer.from(JSON.stringify({ userId: senderId })), // ✅ send object
            {
                replyTo: queue,
                correlationId: correlationId1,
            }
        );

        const sender = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("User detail response timeout"));
            }, 5000);

            channel.consume(
                queue,
                (msg) => {
                    console.log("Listening for:", correlationId1);
                    if (msg.properties.correlationId === correlationId1) {
                        clearTimeout(timeout); // ✅ FIXED
                        channel.ack(msg);
                        resolve(JSON.parse(msg.content.toString()));
                    }
                },
                { noAck: false }
            );
        });

        console.log(sender, "sender detail");


        // Send request to user service
        const correlationId2 = uuidv4();
        const { queue: queue2 } = await channel.assertQueue("", { exclusive: true });
        channel.sendToQueue("user_find_queue",
            Buffer.from(JSON.stringify({ userId: receiverId })), // ✅ send object
            {
                replyTo: queue2,
                correlationId: correlationId2,
            }
        );

        const receiver = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("User detail response timeout"));
            }, 5000);
            channel.consume(queue2,
                (msg) => {
                    console.log("Listening for:", correlationId2);
                    if (msg.properties.correlationId === correlationId2) {
                        clearTimeout(timeout); // ✅ FIXED
                        channel.ack(msg);
                        resolve(JSON.parse(msg.content.toString()));
                    }
                },
                { noAck: false }
            );
        });

        console.log(receiver, "receiver detail");
        if (!sender || !receiver) {
            return res.status(400).json({
                status: false,
                message: 'Users are not found in the database.'
            });
        }

        if (!isExits) {
            const conversation = await ConversationModel.create({
                participants: [senderId, receiverId],
            });
            const newMessage = await MessageModel.create({
                senderId,
                receiverId,
                message
            });
            conversation.messages.push(newMessage._id);
            await conversation.save();
            console.log('first')
            return res.status(200).json({
                status: true,
                message: 'Message sent successfully',
                data: newMessage
            });
        }
        // console.log('first2')

        // Find an existing conversation or create a new one
        let conversation = await ConversationModel.findOneAndUpdate(
            { participants: { $all: [senderId, receiverId] } }, // Corrected: Use $all to match all elements
            { $setOnInsert: { participants: [senderId, receiverId] } }, // Corrected: Use $setOnInsert for the update operation
            { new: true, upsert: true } // Correct options syntax
        );

        // console.log(conversation, "conversation")
        // Create a new message
        const newMessage = await MessageModel.create({
            senderId,
            receiverId,
            message
        });

        // Add the new message to the conversation
        conversation.messages.push(newMessage._id);
        await conversation.save();

        // Respond with success
        res.status(200).json({
            status: true,
            message: 'Message sent successfully',
            data: newMessage // Optionally include the new message in the response
        });
    } catch (error) {
        console.error(error); // Improved error logging
        next(error); // Pass the error to the next middleware (e.g., error handler)
    }
};
const getMessage = async (req, res, next) => {
    try {
        // pagination 
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit
        const { id: userToChatId } = req.params;
        const senderId = req.userId;
        const conversation = await ConversationModel.findOne({
            participants: { $all: [userToChatId, senderId] }
        }).populate({
            path: "messages",
        });

        console.log(conversation, "conversation")
        // if (!conversation) {
        //     return res.status(400).json({
        //         status: false,
        //         message: 'Conversation not found.'
        //     })
        // }
        const conversations = conversation?.messages

        // console.log(conversations, "conversations")
        res.status(200).json({ status: true, message: conversations });

    } catch (error) {
        console.log(error, 'err');
        next(error);
    }
}

module.exports = { sendMessage, getMessage };
