module.exports = (req, res, next) => {
  const currentTime = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl;
  const log = `[${currentTime}] ${method} ${path}`;
  console.log(log);
  next();
};
