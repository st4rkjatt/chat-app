var uuidv4 = require("uuid").v4;
var rabbitMQ = require("../services/rabbitMq");

 const requestUserDetails = async (userId) => {
    const channel = await rabbitMQ();

    // Create an exclusive reply queue for this request
    const { queue } = await channel.assertQueue("", { exclusive: true });
    const correlationId = uuidv4();

    // Send request
    channel.sendToQueue(
        "user_find_queue",
        Buffer.from(JSON.stringify({ userId })),
        {
            replyTo: queue,
            correlationId,
        }
    );

    // Listen for reply
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("User detail response timeout"));
        }, 5000);

        channel.consume(
            queue,
            (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    clearTimeout(timeout);
                    channel.ack(msg);
                    resolve(JSON.parse(msg.content.toString()));
                }
            },
            { noAck: false }
        );
    });
};

module.exports = requestUserDetails;
