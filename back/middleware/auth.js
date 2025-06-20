const jwt = require("jsonwebtoken");
const ErrorMiddleware = require("../utils/ErrorHandler");
const rabbitMQ = require("../services/rabbitMq.js");
const { v4: uuidv4 } = require("uuid");


module.exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ message: "Token not provided" });

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) reject(new Error("Token has expired"));
        else resolve(decoded);
      });
    });

    req.userId = decoded.id;

    const channel = await rabbitMQ();
    const correlationId = uuidv4();

    // ✅ Create a temporary exclusive queue for the reply
    const { queue } = await channel.assertQueue("", { exclusive: true });

    // ✅ Send message to `user_find_queue`
    channel.sendToQueue(
      "user_find_queue",
      Buffer.from(JSON.stringify({ userId: req.userId })),
      {
        replyTo: queue,
        correlationId,
      }
    );

    // ✅ Wait for response on reply queue
    const userDetail = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("User detail response timeout"));
      }, 5000);

      channel.consume(queue, (msg) => {
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          channel.ack(msg);
          resolve(JSON.parse(msg.content.toString()));
        }
      },
        { noAck: false }
      );
    });

    if (!userDetail) {
      return next(new ErrorMiddleware("User not found.", 400));
    }

    req.user = userDetail;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
