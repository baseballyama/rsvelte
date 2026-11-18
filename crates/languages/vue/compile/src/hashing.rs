//! SHA-256 (FIPS 180-4), for outputs a tool derives from a digest: `@vitejs/plugin-vue`'s scope
//! identifier is the first eight hex digits of the SHA-256 of the component's path.

const BLOCK_BYTES: usize = 64;
const LENGTH_BYTES: usize = 8;
const TAIL_BYTES: usize = 2 * BLOCK_BYTES;

const H0: [u32; 8] = [
    0x6A09_E667,
    0xBB67_AE85,
    0x3C6E_F372,
    0xA54F_F53A,
    0x510E_527F,
    0x9B05_688C,
    0x1F83_D9AB,
    0x5BE0_CD19,
];

#[must_use]
pub(crate) fn sha256(data: &[u8]) -> [u8; 32] {
    let mut h = H0;
    let bit_len = (data.len() as u64).wrapping_mul(8);
    // Keep short paths and their padding in one compression call.
    let (blocks, rest) = if data.len() < TAIL_BYTES - LENGTH_BYTES {
        (&[][..], data)
    } else {
        data.as_chunks::<BLOCK_BYTES>()
    };
    if !blocks.is_empty() {
        sha2::block_api::compress256(&mut h, blocks);
    }
    let mut tail = [0u8; TAIL_BYTES];
    tail[..rest.len()].copy_from_slice(rest);
    tail[rest.len()] = 0x80;
    let tail_len = if rest.len() < BLOCK_BYTES - LENGTH_BYTES {
        BLOCK_BYTES
    } else {
        TAIL_BYTES
    };
    tail[tail_len - LENGTH_BYTES..tail_len].copy_from_slice(&bit_len.to_be_bytes());
    sha2::block_api::compress256(&mut h, tail[..tail_len].as_chunks::<BLOCK_BYTES>().0);
    let mut out = [0u8; 32];
    for (o, word) in out.as_chunks_mut::<4>().0.iter_mut().zip(h) {
        *o = word.to_be_bytes();
    }
    out
}

/// Lowercase hex of `bytes`.
#[must_use]
pub(crate) fn hex(bytes: &[u8]) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        s.push(char::from(DIGITS[usize::from(b >> 4)]));
        s.push(char::from(DIGITS[usize::from(b & 15)]));
    }
    s
}

#[cfg(test)]
mod tests;
