import express from 'express';
import passport from 'passport';

const router = express.Router();

// GET /auth/google
// Initiates the Google OAuth login flow.
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /auth/google/callback
// The URL Google redirects to after the user has authenticated.
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    // On successful authentication, redirect to the frontend dashboard.
    res.redirect('http://localhost:5173/boards'); 
  }
);

// GET /auth/logout
// Logs the user out and clears their session.
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // On successful logout, redirect to the frontend landing page.
    res.redirect('http://localhost:5173/');
  });
});

// GET /auth/current_user
// An endpoint for the frontend to check if a user is logged in.
router.get('/current_user', (req, res) => {
  res.send(req.user);
});

export default router;