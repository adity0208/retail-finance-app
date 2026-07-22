import crypto from 'crypto';
import { Clothing } from '../models/Clothing.js';
import { Electronics } from '../models/Electronics.js';

// Generate a short alphanumeric code (uppercase, no ambiguous characters)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomCode(length = 8) {
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += CHARS[bytes[i] % CHARS.length];
  }
  return out;
}

export async function generateUniqueLookupCode(length = 8) {
  // Try a limited number of attempts to avoid infinite loops
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode(length);
    // Check both collections for uniqueness
    const existsInClothing = await Clothing.exists({ quickLookupCode: code });
    if (existsInClothing) continue;
    const existsInCooler = await Cooler.exists({ quickLookupCode: code });
    if (existsInCooler) continue;
    return code;
  }
  // Fallback to a longer random string
  return randomCode(length * 2);
}
