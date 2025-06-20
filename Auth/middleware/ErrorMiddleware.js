const ErrorMiddleware = (err, req, res, next) => {
  console.log(err,'eee')
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    status: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
