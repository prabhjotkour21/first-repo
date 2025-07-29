
const errorHandler=(err, req, res, next)=> {
  // console.error(err); //    for debugging

  const messageArray = err.message ? err.message.split("::") : [];

  if (messageArray.length === 3) {
    return res.status(Number(messageArray[0])).json({
      status: false,
      response_code: Number(messageArray[1]),
      message: messageArray[2],
    });
  }

  res.status(500).json({
    status: false,
    response_code: 500,
    message:
      process.env.ENVIRONMENT === "production"
        ? "Validation failed."
        :  "Something went wrong. Please try again later."
  });
}

export {errorHandler};


// const errorHandler = (err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const responseCode = err.responseCode || statusCode;
//   const isProduction = process.env.ENVIRONMENT === "production";

//   res.status(statusCode).json({
//     status: false,
//     response_code: responseCode,
//     message: isProduction && statusCode === 500
//       ? "Something went wrong. Please try again later."
//       : err.message || "Unexpected error",
//   });
// };

// export { errorHandler };
