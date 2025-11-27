import crypto from 'crypto';
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 1000, 32, 'sha256', (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.toString('hex'));
      }
    })
  })
}

export const checkPassword = async (hashedPassword:string, password: string, salt: string): Promise<boolean> => {
  try {
    let newlyHashedPassword = await hashPassword(password, salt);
    if (crypto.timingSafeEqual(Buffer.from(hashedPassword, 'hex'), Buffer.from(newlyHashedPassword, 'hex'))) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const createJWTToken = (user: any) => {
  let token = jwt.sign({ sub: user }, process.env.JWT_SECRET || 'badd_secret_ensure_env_is_present_and_loaded', { expiresIn: '1h' });
  return token;
}
