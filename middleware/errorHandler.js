exports.notFound = (req, res) => {
  res.status(404).json({ error: "Not Found" });
};

exports.errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  // Avoid leaking internals in production
  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    error: err.message || "Server error",
    ...(isProd ? {} : { detail: err.detail || null, stack: err.stack }),
  });
};
