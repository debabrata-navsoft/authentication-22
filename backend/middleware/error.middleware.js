export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, _next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    return res.status(409).json({ message: `${field} is already registered` });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
};
