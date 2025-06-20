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

    try {
      const { userId } = JSON.parse(msg.content.toString());
      const userDetails = await UserModel.findById(userId).select("-password").lean();

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(userDetails || {})),
        { correlationId: msg.properties.correlationId }
      );

      channel.ack(msg);
    } catch (error) {
      console.error("Error processing message:", error);
      channel.nack(msg, false, false);
    }
  });

  console.log("Auth microservice is listening for user_find_queue...");
})();




