const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Decode(input) {
  const str = input.toUpperCase().replace(/\s/g, '').replace(/=+$/, '')
  let bits = 0
  let value = 0
  const output = []

  for (const char of str) {
    const idx = BASE32_CHARS.indexOf(char)
    if (idx === -1) throw new Error(`Geçersiz Base32 karakter: ${char}`)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

export function getTimeLeft(period = 30) {
  return period - (Math.floor(Date.now() / 1000) % period)
}

export async function generateTOTP(secret, period = 30) {
  const keyBytes = base32Decode(secret)
  const counter = Math.floor(Date.now() / 1000 / period)

  const counterBytes = new ArrayBuffer(8)
  const view = new DataView(counterBytes)
  view.setUint32(0, Math.floor(counter / 0x100000000), false)
  view.setUint32(4, counter & 0xffffffff, false)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBytes)
  const hash = new Uint8Array(signature)

  const offset = hash[hash.length - 1] & 0xf
  const code =
    (((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)) %
    1_000_000

  return code.toString().padStart(6, '0')
}
