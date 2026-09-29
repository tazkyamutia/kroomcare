const crypto = require('crypto');

// Konstanta parameter scrypt (mengikuti OWASP recommendation)
const SCRYPT_N = 16384; // CPU/memory cost
const SCRYPT_R = 8;     // block size
const SCRYPT_P = 1;     // parallelization
const KEY_LEN = 64;     // output length (bytes)
const SALT_LEN = 16;    // salt length (bytes)
const PREFIX = 'scrypt';

/**
 * Hash password menggunakan Node.js built-in crypto.scrypt.
 * Format penyimpanan: scrypt$<salt_hex>$<hash_hex>
 * Tidak memerlukan dependency eksternal.
 */
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(SALT_LEN);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${PREFIX}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
};

/**
 * Verifikasi password terhadap hash tersimpan.
 * Mendukung dua format:
 *  - Format scrypt (baru): scrypt$<salt>$<hash>
 *  - Plaintext (legacy database): dibandingkan langsung string.
 *
 * Mengembalikan { match: boolean, needsRehash: boolean }.
 * needsRehash=true menandakan password cocok tapi masih plaintext di DB
 * sehingga perlu di-hash ulang (migrasi bertahap).
 */
const verifyPassword = async (password, stored) => {
  if (!stored) return { match: false, needsRehash: false };

  // Legacy plaintext di database
  if (!stored.startsWith(`${PREFIX}$`)) {
    const match = (stored === password);
    return { match, needsRehash: match };
  }

  const [, saltHex, hashHex] = stored.split('$');
  if (!saltHex || !hashHex) return { match: false, needsRehash: false };

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');
    const derivedKey = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, expectedHash.length, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    const match = crypto.timingSafeEqual(derivedKey, expectedHash);
    return { match, needsRehash: false };
  } catch (err) {
    console.error('Error verifying scrypt password:', err.message);
    return { match: false, needsRehash: false };
  }
};

module.exports = {
  hashPassword,
  verifyPassword
};