import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
// isAuthenticated...
import '../utils/passport.js';
//TODO: Friday: add this import until isAuthenticated is added
// import { isAuthenticated } from '../middleware/auth.js';

const authRouter = Router();

//called from browser click on login button
authRouter.get('/login', (req, res, next) => {
  const { redirect_url } = req.query;

  const state = redirect_url ? Buffer.from(JSON.stringify(redirect_url)).toString('base64') : undefined;
  //now call the passport method to authenticate with google...
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
});

//called by Google after Authentication process
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/fail', session: false }), (req, res) => {
  //the req.user object will contain the google profile object
  console.log(req.user);
  //googleId, email, name, avatar
  console.log(req.query.state);
  const decoded = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
  let redirectUrl = decoded.redirect_url || 'http://localhost:9022/private.html';

  //create a token with the user profile info to send back to the browser
  //It could be just the googleId if you want
  const payload = { id: req.user.googleId, name: req.user.name, email: req.user.email, avatar: req.user.avatar };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.redirect(`${redirectUrl}?token=${token}`); //redirect back to the browser
  // res.redirect('/success?token=${token}'); // as just a test in our API
});

//TODO: Friday add the /private endpoint

export default authRouter;
