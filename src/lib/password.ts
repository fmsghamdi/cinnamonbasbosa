import crypto from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const ITERATIONS = 100000
const DIGEST = 'sha512'

/**
 * Hash a password using PBKDF2 (built-in Node.js crypto)
 * Returns a string in format: salt:hash
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
    return `${salt}:${hash}`
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false

    const verifyHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
    return hash === verifyHash
}

/**
 * Check if a password is already hashed (starts with hex salt:hash pattern)
 */
export function isHashed(password: string): boolean {
    const parts = password.split(':')
    if (parts.length !== 2) return false
    // Check if both parts are valid hex strings of expected lengths
    return parts[0].length === SALT_LENGTH * 2 && parts[1].length === KEY_LENGTH * 2
}
