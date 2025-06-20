const amqp = require('amqplib')

const rabbitMQ_URL = 'amqp://localhost'
async function rabbitMQ() {
  const exchange = "chat_app_exchange"
  const queueUser = 'user_queue'
  const queueUserDetail = 'receive_user_queue'
  const connection = await amqp.connect(rabbitMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange, "direct", { durabale: false })
  await channel.assertQueue(queueUser, { durable: false });
  await channel.assertQueue(queueUserDetail, { durable: false });
  return channel
};

module.exports = rabbitMQ


