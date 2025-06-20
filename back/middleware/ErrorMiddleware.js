const ErrorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;
  // console.log(err.message, err.statusCode, "errr misdddle ware");
  res.status(err.statusCode).json({
    status: false,
    message: err.message,
  });
};

module.exports = ErrorMiddleware;
