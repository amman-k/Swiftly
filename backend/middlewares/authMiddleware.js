const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(400).json({ message: "Not Authorized.Please login in" });
  }
};

export { protect };
