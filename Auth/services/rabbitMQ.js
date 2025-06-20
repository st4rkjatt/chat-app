import amqp from 'amqplib';
import UserModel from '../models/authModel.js';
const rabbitMQ_URL = 'amqp://localhost'

const queueUser = 'user_find_queue'
const queueUserDetail = 'receive_user_queue'
export const rabbitMQ = async () => {
  const exchange = "chat_app_exchange"
  const connection = await amqp.connect(rabbitMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange, "direct", { durabale: false })
  await channel.assertQueue(queueUser, { durable: false });
  await channel.assertQueue(queueUserDetail, { durable: false });
  console.log('RabbitMq connected')
  return channel
};

(async () => {
  const channel = await rabbitMQ();

  const queueUser = "user_find_queue";

  await channel.assertQueue(queueUser, { durable: false });

  await channel.consume(queueUser, async (msg) => {
    if (!msg) return;
    console.log(`Attempting to consume from queue: ${queueUser}`);
    console.log('function call')
    try {
      const { userId } = JSON.parse(msg.content.toString());

      const userDetails = await UserModel.findById(userId).select("-password").lean();
      console.log("User details found:", userDetails);
      console.log(msg.properties, 'msg.properties');
      // ✅ Send to the reply queue using the correlationId
      const sendToqueue = channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(userDetails || {})),
        {
          correlationId: msg.properties.correlationId,
        }
      );
      if (!sendToqueue) {
        console.error(`Failed to send message to reply queue: ${msg.properties.replyTo}`);
      } else {
        console.log(`Message successfully sent to reply queue: ${msg.properties.replyTo}`);
        channel.ack(msg);
      }

    } catch (error) {
      console.error("Error processing user_find_queue message:", error);
      channel.nack(msg, false, false); // Reject message
    }
  });

  console.log("Auth microservice is listening for user_find_queue...");
})();



