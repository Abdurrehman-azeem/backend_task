import crypto from 'crypto';

export const hashPassword = (password: string, salt: string): Promise<string> => {

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
