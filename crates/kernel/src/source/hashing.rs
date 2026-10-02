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
pub fn sha256(data: &[u8]) -> [u8; 32] {
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
pub fn hex(bytes: &[u8]) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        s.push(char::from(DIGITS[usize::from(b >> 4)]));
        s.push(char::from(DIGITS[usize::from(b & 15)]));
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    // FIPS 180-4 examples, and a message whose padding needs a second block.
    #[test]
    fn known_digests() {
        assert_eq!(
            hex(&sha256(b"")),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        assert_eq!(
            hex(&sha256(b"abc")),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
        assert_eq!(
            hex(&sha256(
                b"abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"
            )),
            "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
        );
        assert_eq!(
            hex(&sha256(&vec![b'a'; 1_000_000])),
            "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"
        );
    }

    #[test]
    fn binary_padding_boundaries() {
        for (len, expected) in [
            (
                55_usize,
                "0a029c039b4853c530f7cef160a48c06e06ab8233c46b665d088a825f5a49c93",
            ),
            (
                56,
                "74d933e31f80a44b658969a1d4a7d078f785ba9f789e1f7c95f7bc8a70e0e34a",
            ),
            (
                63,
                "9c1546d1c4de7e0f37dd1ee89f5fcbf3a976b9d778d1034edbc74914e6f7cfdb",
            ),
            (
                64,
                "4fd817dcaa16924ddf8b172da321a4189440c800686d043b25121267078c9d45",
            ),
            (
                65,
                "91c1b77da0bc3f612880a13a86a518aa8493cb5c5780b60f6d52d592485f89d4",
            ),
            (
                119,
                "13cfd93a8d755041af964735096349e0b900b65c0e380a6e7bac47f8f96b096f",
            ),
            (
                120,
                "8c4ae9614e608bace52efc98f5a0ec79571830aaa10222e51644f9217d2081f8",
            ),
            (
                127,
                "604c12530dc8c7cea548f7cac8ff22bdf7a1fea7bf0dd948bfd10b077ec5fcef",
            ),
            (
                128,
                "c3ffe4a6a7e0702fa12098468d55cfa10079dc4b5c13382bdf94147c0834f939",
            ),
            (
                129,
                "f132cd23d6b7c172dcd6fbe092143abba720662a00b5225f15cd47ee29dae320",
            ),
            (
                191,
                "f58f24db8156db569960d08a8dfc26b5ad48f8d2271ca08cbba5d95a52368894",
            ),
            (
                192,
                "7ac63b07f1ba0e58f8f8c171ef2429c22f4a8529002d05193291c0d4df52fe2a",
            ),
            (
                193,
                "51e8a05ed4d5d5cb1b47a0b1fbc8c6b74a47c47fd63e6fe158b45554c605c851",
            ),
        ] {
            let data: Vec<u8> = (0..len)
                .map(|i| (i as u8).wrapping_mul(37).wrapping_add(len as u8))
                .collect();
            assert_eq!(hex(&sha256(&data)), expected, "length {len}");
        }
    }
}
