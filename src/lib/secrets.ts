import { CipherGCMOptions, createDecipheriv, DecipherCCM } from 'crypto';

const CRYPTO_CONSTANTS = {
    KEY_LENGTH: 32,
    NONCE_LENGTH: 12,
    AUTH_TAG_LENGTH: 16,
    ALGORITHM: 'chacha20-poly1305'
};

function validateKey(key: Buffer): void {
    if (key.length !== CRYPTO_CONSTANTS.KEY_LENGTH) {
        throw new Error(`Key must be ${CRYPTO_CONSTANTS.KEY_LENGTH} bytes for ${CRYPTO_CONSTANTS.ALGORITHM}`);
    }
}

function validateNonce(nonce: Buffer): void {
    if (nonce.length !== CRYPTO_CONSTANTS.NONCE_LENGTH) {
        throw new Error(`Nonce must be ${CRYPTO_CONSTANTS.NONCE_LENGTH} bytes for ${CRYPTO_CONSTANTS.ALGORITHM}`);
    }
}

function decryptValueWithAgentKey(value: string): Promise<string> {
  const key = Buffer.from(process.env.AGENT_KEY || '', 'base64');
  validateKey(key);

  const [nonce, ciphertext] = value.split(':').map(part => Buffer.from(part, 'base64'));
  if (!nonce || !ciphertext) {
    throw new Error('Agent key is not set');
  }
  validateNonce(nonce);

  const authTag = ciphertext.subarray(0, CRYPTO_CONSTANTS.AUTH_TAG_LENGTH);
  const encryptedData = ciphertext.subarray(CRYPTO_CONSTANTS.AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(CRYPTO_CONSTANTS.ALGORITHM, key, nonce, {
    authTagLength: CRYPTO_CONSTANTS.AUTH_TAG_LENGTH
  } as CipherGCMOptions) as DecipherCCM;

  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return Promise.resolve(decrypted.toString());
}

export { decryptValueWithAgentKey };
