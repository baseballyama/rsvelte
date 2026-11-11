//! The framing of `tsc --api`: each message is a `MessagePack` array of three, `[type, method,
//! payload]`, with the method and payload as `bin` fields.

use std::io::{Read, Write};

const FIXARRAY3: u8 = 0x93;
const UINT8: u8 = 0xCC;
const BIN8: u8 = 0xC4;
const BIN16: u8 = 0xC5;
const BIN32: u8 = 0xC6;

pub(crate) const REQUEST: u8 = 1;
pub(crate) const CALL_ERROR: u8 = 3;
pub(crate) const RESPONSE: u8 = 4;
pub(crate) const ERROR: u8 = 5;
pub(crate) const CALL: u8 = 6;

pub(crate) struct Message {
    pub kind: u8,
    pub method: Vec<u8>,
    pub payload: Vec<u8>,
}

pub(crate) fn write(
    out: &mut impl Write,
    kind: u8,
    method: &[u8],
    payload: &[u8],
) -> std::io::Result<()> {
    let mut header = Vec::with_capacity(16 + method.len());
    header.push(FIXARRAY3);
    header.push(kind);
    bin_header(&mut header, method.len())?;
    header.extend_from_slice(method);
    bin_header(&mut header, payload.len())?;
    out.write_all(&header)?;
    out.write_all(payload)?;
    out.flush()
}

fn bin_header(out: &mut Vec<u8>, len: usize) -> std::io::Result<()> {
    if let Ok(n) = u8::try_from(len) {
        out.extend_from_slice(&[BIN8, n]);
    } else if let Ok(n) = u16::try_from(len) {
        out.push(BIN16);
        out.extend_from_slice(&n.to_be_bytes());
    } else {
        let n = u32::try_from(len).map_err(|e| invalid(&e.to_string()))?;
        out.push(BIN32);
        out.extend_from_slice(&n.to_be_bytes());
    }
    Ok(())
}

pub(crate) fn read(input: &mut impl Read) -> std::io::Result<Message> {
    if byte(input)? != FIXARRAY3 {
        return Err(invalid("expected a three-element array"));
    }
    let kind = match byte(input)? {
        k @ 0..=0x7F => k,
        UINT8 => byte(input)?,
        _ => return Err(invalid("expected a message type")),
    };
    let method = bin(input)?;
    let payload = bin(input)?;
    Ok(Message {
        kind,
        method,
        payload,
    })
}

fn bin(input: &mut impl Read) -> std::io::Result<Vec<u8>> {
    let len = match byte(input)? {
        BIN8 => usize::from(byte(input)?),
        BIN16 => {
            let mut b = [0; 2];
            input.read_exact(&mut b)?;
            usize::from(u16::from_be_bytes(b))
        }
        BIN32 => {
            let mut b = [0; 4];
            input.read_exact(&mut b)?;
            usize::try_from(u32::from_be_bytes(b)).map_err(|e| invalid(&e.to_string()))?
        }
        _ => return Err(invalid("expected a bin field")),
    };
    let mut data = vec![0; len];
    input.read_exact(&mut data)?;
    Ok(data)
}

fn byte(input: &mut impl Read) -> std::io::Result<u8> {
    let mut b = [0];
    input.read_exact(&mut b)?;
    Ok(b[0])
}

fn invalid(why: &str) -> std::io::Error {
    std::io::Error::new(std::io::ErrorKind::InvalidData, why)
}
