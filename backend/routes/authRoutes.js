import express from 'express';
import passport from 'passport';

const router=express.Router();

/**
 * @route   GET /auth/google
 * @desc    Initiates the Google OAuth 2.0 authentication flow.
 * @access  Public
 * When a user clicks "Login with Google", they are sent to this route.
 * Passport then redirects them to Google's consent screen.
 */

router.get('/google',passport.authenticate('google',{scope:['profile','email']}));

/**
 * @route   GET /auth/google/callback
 * @desc    The callback URL that Google redirects to after successful authentication.
 * @access  Public
 * Passport middleware intercepts this request, exchanges the code for a profile,
 * runs our verify function (from passport.js), and then attaches the user to req.user.
 */

router.get('/google/callback',
    passport.authenticate('google',{failureRedirect:'/login'}),
    (req,res)=>{
        res.redirect('http://localhost:5173/boards');
    }
);

/**
 * @route   GET /auth/current_user
 * @desc    Gets the currently authenticated user's data.
 * @access  Private
 * The frontend will call this route after loading to check if a user is logged in
 * and to get their details (name, avatar, etc.).
 */

router.get('/current_user',(req,res)=>{
    res.send(req.user);
});

export default router;