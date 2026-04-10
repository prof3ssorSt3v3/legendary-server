import passport from 'passport'; //communicate with various OAuth solutions
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
//specifically Google OAuth
import { Strategy as BearerStrategy } from 'passport-http-bearer';
//Handle Authorization Headers
import jwt from 'jsonwebtoken'; //for token verification and creation
//we would import functions another file from the db folder that has the methods we want to use
// import { createSession, verifySession } from '../db/sessions.js';

//TODO: Friday missing `GOOGLE_`
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
const googleClient = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
};

//for google oauth
passport.use(
  new GoogleStrategy(googleClient, async (_accessToken, _refreshToken, profile, complete) => {
    try {
      // here, we will look up a user by the googleId, and either
      const user = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
      };
      // create a new User if none exists, or
      // update the existing User in users table, in case they changed their name in google.
      // or create sessions entry in database sessions table
      // const u = await createSession(user);

      return complete(null, user);
    } catch (error) {
      return complete(error);
    }
  }),
);

//bearer token handling
passport.use(
  // the strategy gets the token for us from the headers.
  new BearerStrategy(async function (token, done) {
    try {
      // we decoded the token using the verify method. This will throw an error if the signature cannot be verified
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const user = decodedToken;
      // next, we use the id from our token to lookup the user in Postgres
      // const u = await verifySession(user);

      // finally, we either throw an error, or pass on the user to passports callback function
      if (!user) {
        throw new Error('Unauthorized');
      }
      done(null, user); //or pass user
    } catch (error) {
      done(new Error('Unauthorized'));
    }
  }),
);
