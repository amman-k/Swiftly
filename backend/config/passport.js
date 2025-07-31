import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from 'dotenv';
import User from '../models/userModel';

dotenv.config();

const configurePassport =()=>{
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("FATAL ERROR: Google OAuth credentials are not defined in .env file.");
    process.exit(1);
  }

  passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:'auth/google/callback',
            scope:['profile','email'],
        },
        async (accessToken,refreshToken,profile,done)=>{
            try{
                let user=await User.findOne({googleId:profile.id});
                if(user){
                    return done(null,user);
                }else{
                    const newUser= new User({
                        googleId:profile.id,
                        name:profile.displayName,
                        email:profile.emails[0].value,
                        avatar:profile.photos[0].value,

                    });
                    user= await newUser.save();
                    return done(null,user);
                }
            }catch (err) {
          console.error("Error in Google Strategy:", err);
          return done(err, null);
        }
        }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
export default configurePassport;