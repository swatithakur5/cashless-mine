import CryptoJS from "crypto-js";
import {environment} from "../../environments/environment.dev";

let key = environment.PASSWORD_SECRET_KEY

export function encrypt(password: string): string {
  const iv = CryptoJS.lib.WordArray.random(16);  // Generate random IV
  const encrypted = CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(key), {
    iv: iv,
    mode: CryptoJS.mode.CBC,  // Use CBC mode instead of ECB
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));  // Prepend IV to ciphertext
}

export function decryptData(encryptedData: string): string {
  if(!encryptedData){return ''}
  const encryptedDataBytes = CryptoJS.enc.Base64.parse(encryptedData);
  const iv = CryptoJS.lib.WordArray.create(encryptedDataBytes.words.slice(0, 4));  // Extract IV (16 bytes)
  const ciphertext = CryptoJS.lib.WordArray.create(encryptedDataBytes.words.slice(4));  // Extract ciphertext
  const key = CryptoJS.enc.Utf8.parse(environment.PASSWORD_SECRET_KEY); // Ensure the key is 32 bytes
  let c: any = {ciphertext: ciphertext}
  const decrypted = CryptoJS.AES.decrypt(
    c,
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}
