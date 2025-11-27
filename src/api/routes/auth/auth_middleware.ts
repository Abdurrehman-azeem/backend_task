import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import passport from 'passport';
import session from 'express-session';

import { checkPassword, createJWTToken } from '../../../utils/crypto_utils';
import { findUserByUsername, findUserById } from '../../../db/models/user';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'not_so_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true },
});

passport.serializeUser(async (user: any, callback) => {
  process.nextTick(() => {
    return callback(null, {
      id: user.id,
      username: user.username,
    });
  });
});

passport.deserializeUser(async (id: any, callback) => {
  try {
    let user: any = await findUserById(id);
    let expressUser: Express.User = {
      id: user?.id,
      username: user?.username
    }
    return callback(null, expressUser);
  } catch(err) {
    return callback(err);
  }
})

export const passportLoginMiddleware = passport.use(new LocalStrategy.Strategy(async (username: string, password: string, callback) => {
  try {
    let user: any = await findUserByUsername(username);

    if (user === null) {
      return callback(null, false,{ message: "Incorrect username or password." });
    }

    let correctPassword: boolean = await checkPassword(user?.password || '', password, user?.salt || '');
    if (correctPassword) {
      let expressUser: Express.User = {
        id: user.id,
        username: user.username
      }
      return callback(null, expressUser);
    }

    return callback(null, false,{ message: "Incorrect username or password." });
  } catch(err) {
    console.error(err);

    return callback(err);
  }
}));

export const passportJWTMiddleware = passport.use(new JwtStrategy(
  { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET || 'ensure_env_is_loaded_not_secret' },
  async (payload, callback) => {
   try {
     console.log("hello")
     // This payload is derived from the token, thus it's safe.
     // User should not be able to spoof their id.
     let user:any = await findUserById(payload.sub.id);
     if (user) {
       user.token = createJWTToken(user);
       return callback(null, user);
     }

     return callback(null, false, "Token is invalid.");
   } catch(err) {
     return callback(err, false);
   }
  }
));
