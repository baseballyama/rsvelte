//! Raw-transfer envelope format for `compile()` results.
//!
//! Steps 2 & 3 of the Rust↔JS boundary optimization plan: pack the
//! entire `CompileResult` into one contiguous byte buffer with a
//! fixed-layout header, hand the buffer to V8 as-is, and let the JS
//! side decode fields lazily on demand.
//!
//! ## Envelope v1 layout
//!
//! ```text
//! offset  size  field
//! 0       4     magic        "RSV1" (0x31_56_53_52 LE)
//! 4       4     version      u32 LE — bumped on layout breaks
//! 8       4     total_len    u32 LE — sanity check, matches buffer.byteLength
//! 12      4     flags        u32 LE — bit0 has_css, bit1 runes, bit2 css_has_global
//! 16      4     js_code_off
//! 20      4     js_code_len
//! 24      4     js_map_off   0 = absent
//! 28      4     js_map_len
//! 32      4     css_code_off 0 = absent
//! 36      4     css_code_len
//! 40      4     css_map_off  0 = absent
//! 44      4     css_map_len
//! 48      4     warnings_off
//! 52      4     warnings_count
//! 56      4     warnings_len
//! 60..    var   payload bytes (concatenated UTF-8 strings + warnings stream)
//! ```
//!
//! ### Warnings stream
//!
//! Concatenation of `warnings_count` records:
//!
//! ```text
//! u32 LE code_len    | code bytes
//! u32 LE message_len | message bytes
//! u8     flags       bit0 has_filename, bit1 has_start, bit2 has_end, bit3 has_frame
//! if has_filename: u32 len, bytes
//! if has_start:    u32 line, u32 column, u32 character
//! if has_end:      u32 line, u32 column, u32 character
//! if has_frame:    u32 len, bytes
//! ```
//!
//! All integers are little-endian, all strings are UTF-8 (no length
//! prefix beyond the leading `u32`), and offsets are measured from
//! the start of the envelope. A `0` offset means "absent" (the spec
//! never uses offset 0 for real data since the header alone occupies
//! the first 60 bytes).

use crate::compiler::{CompileResult, Position, Warning};

pub const MAGIC: u32 = 0x3156_5352; // "RSV1" little-endian read
pub const VERSION: u32 = 1;
pub const HEADER_LEN: usize = 60;

pub const FLAG_HAS_CSS: u32 = 1 << 0;
pub const FLAG_RUNES: u32 = 1 << 1;
pub const FLAG_CSS_HAS_GLOBAL: u32 = 1 << 2;

const WARN_HAS_FILENAME: u8 = 1 << 0;
const WARN_HAS_START: u8 = 1 << 1;
const WARN_HAS_END: u8 = 1 << 2;
const WARN_HAS_FRAME: u8 = 1 << 3;

/// Trait abstracting over the backing buffer. Step 2 implements this
/// for `Vec<u8>`; Step 3 implements it for a bumpalo arena handle.
pub trait Writer {
    fn write_bytes(&mut self, bytes: &[u8]);
    fn position(&self) -> usize;
    /// Patch a previously reserved `u32` slot at `offset` with the
    /// little-endian encoding of `value`. Used to fill in offsets
    /// after the payload has been streamed.
    fn patch_u32(&mut self, offset: usize, value: u32);
}

impl Writer for Vec<u8> {
    #[inline]
    fn write_bytes(&mut self, bytes: &[u8]) {
        self.extend_from_slice(bytes);
    }
    #[inline]
    fn position(&self) -> usize {
        self.len()
    }
    #[inline]
    fn patch_u32(&mut self, offset: usize, value: u32) {
        self[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
    }
}

/// Estimate the byte size of an encoded `CompileResult`. Used by
/// Step 3 to pre-allocate the bumpalo arena in one go, avoiding
/// reallocations entirely.
pub fn estimate_size(result: &CompileResult) -> usize {
    let mut n = HEADER_LEN;
    n += result.js.code.len();
    if let Some(m) = &result.js.map {
        n += m.len();
    }
    if let Some(css) = &result.css {
        n += css.code.len();
        if let Some(m) = &css.map {
            n += m.len();
        }
    }
    for w in &result.warnings {
        n += warning_size(w);
    }
    n
}

fn warning_size(w: &Warning) -> usize {
    let mut n = 4 + w.code.len() + 4 + w.message.len() + 1; // code+msg+flags
    if let Some(s) = &w.filename {
        n += 4 + s.len();
    }
    if w.start.is_some() {
        n += 12;
    }
    if w.end.is_some() {
        n += 12;
    }
    if let Some(s) = &w.frame {
        n += 4 + s.len();
    }
    n
}

/// Write the envelope into `writer`. Used by both the `Vec<u8>`
/// (Step 2) and `bumpalo` (Step 3) backends.
pub fn encode_into<W: Writer>(writer: &mut W, result: &CompileResult) {
    // Header skeleton — offsets are patched in after payloads land.
    let header_start = writer.position();
    debug_assert_eq!(header_start, 0, "encode_into expects an empty writer");
    writer.write_bytes(&MAGIC.to_le_bytes());
    writer.write_bytes(&VERSION.to_le_bytes());
    writer.write_bytes(&[0u8; 4]); // total_len — patched at the end
    let mut flags: u32 = 0;
    if let Some(css) = &result.css {
        flags |= FLAG_HAS_CSS;
        if css.has_global {
            flags |= FLAG_CSS_HAS_GLOBAL;
        }
    }
    if result.metadata.runes {
        flags |= FLAG_RUNES;
    }
    writer.write_bytes(&flags.to_le_bytes());
    // Reserve the 11 u32 slots (js code/map, css code/map, warnings)
    // — patched in below as each payload is streamed.
    for _ in 0..11 {
        writer.write_bytes(&[0u8; 4]);
    }
    debug_assert_eq!(writer.position(), HEADER_LEN);

    // js.code
    let js_code_off = writer.position();
    writer.write_bytes(result.js.code.as_bytes());
    writer.patch_u32(16, js_code_off as u32);
    writer.patch_u32(20, result.js.code.len() as u32);

    // js.map (optional)
    if let Some(map) = &result.js.map {
        let off = writer.position();
        writer.write_bytes(map.as_bytes());
        writer.patch_u32(24, off as u32);
        writer.patch_u32(28, map.len() as u32);
    }

    // css.code / css.map (optional)
    if let Some(css) = &result.css {
        let off = writer.position();
        writer.write_bytes(css.code.as_bytes());
        writer.patch_u32(32, off as u32);
        writer.patch_u32(36, css.code.len() as u32);
        if let Some(map) = &css.map {
            let off = writer.position();
            writer.write_bytes(map.as_bytes());
            writer.patch_u32(40, off as u32);
            writer.patch_u32(44, map.len() as u32);
        }
    }

    // Warnings stream
    let warnings_off = writer.position();
    for w in &result.warnings {
        write_warning(writer, w);
    }
    let warnings_end = writer.position();
    writer.patch_u32(48, warnings_off as u32);
    writer.patch_u32(52, result.warnings.len() as u32);
    writer.patch_u32(56, (warnings_end - warnings_off) as u32);

    // Total length (for the JS-side sanity check)
    let total = writer.position();
    writer.patch_u32(8, total as u32);
}

fn write_warning<W: Writer>(w: &mut W, warning: &Warning) {
    write_str(w, &warning.code);
    write_str(w, &warning.message);

    let mut flags: u8 = 0;
    if warning.filename.is_some() {
        flags |= WARN_HAS_FILENAME;
    }
    if warning.start.is_some() {
        flags |= WARN_HAS_START;
    }
    if warning.end.is_some() {
        flags |= WARN_HAS_END;
    }
    if warning.frame.is_some() {
        flags |= WARN_HAS_FRAME;
    }
    w.write_bytes(&[flags]);

    if let Some(s) = &warning.filename {
        write_str(w, s);
    }
    if let Some(p) = &warning.start {
        write_position(w, p);
    }
    if let Some(p) = &warning.end {
        write_position(w, p);
    }
    if let Some(s) = &warning.frame {
        write_str(w, s);
    }
}

#[inline]
fn write_str<W: Writer>(w: &mut W, s: &str) {
    w.write_bytes(&(s.len() as u32).to_le_bytes());
    w.write_bytes(s.as_bytes());
}

#[inline]
fn write_position<W: Writer>(w: &mut W, p: &Position) {
    w.write_bytes(&(p.line as u32).to_le_bytes());
    w.write_bytes(&(p.column as u32).to_le_bytes());
    w.write_bytes(&(p.character as u32).to_le_bytes());
}

/// Encode a `CompileResult` into a fresh `Vec<u8>`. Step 2 entry point.
pub fn encode_to_vec(result: &CompileResult) -> Vec<u8> {
    let mut buf = Vec::with_capacity(estimate_size(result));
    encode_into(&mut buf, result);
    buf
}

// =============================================================================
// Step 3: bumpalo-backed writer
// =============================================================================
//
// Writes directly into a pre-sized slice carved out of a `bumpalo::Bump`
// arena. The arena's backing allocation never moves and is freed in one
// shot, so the NAPI side can hand the slice pointer to V8 via
// `napi_create_external_buffer` and drop the `Bump` from the finalizer
// — zero copy, zero per-record `free()`.

/// Fixed-size cursor for writing into a pre-allocated `&mut [u8]`.
/// Panics on overflow — callers guarantee the slice is `estimate_size`
/// bytes wide.
pub struct SliceWriter<'a> {
    buf: &'a mut [u8],
    pos: usize,
}

impl<'a> SliceWriter<'a> {
    #[inline]
    pub fn new(buf: &'a mut [u8]) -> Self {
        Self { buf, pos: 0 }
    }

    #[inline]
    pub fn finished_len(&self) -> usize {
        self.pos
    }
}

impl Writer for SliceWriter<'_> {
    #[inline]
    fn write_bytes(&mut self, bytes: &[u8]) {
        let end = self.pos + bytes.len();
        self.buf[self.pos..end].copy_from_slice(bytes);
        self.pos = end;
    }
    #[inline]
    fn position(&self) -> usize {
        self.pos
    }
    #[inline]
    fn patch_u32(&mut self, offset: usize, value: u32) {
        self.buf[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
    }
}

/// Encode the result into a freshly-allocated slice inside `bump`.
///
/// Returns the raw `(ptr, len)` of the encoded bytes. The pointer is
/// valid for as long as `bump` is alive (typically: until the V8 GC
/// fires the finalizer that drops the `Bump`).
pub fn encode_into_bump<'bump>(
    bump: &'bump bumpalo::Bump,
    result: &CompileResult,
) -> &'bump mut [u8] {
    let size = estimate_size(result);
    // `alloc_slice_fill_copy` zero-fills a u8 slice in the arena and
    // hands it back as `&'bump mut [u8]` — exactly what we need.
    let slice: &'bump mut [u8] = bump.alloc_slice_fill_copy(size, 0u8);
    let mut writer = SliceWriter::new(slice);
    encode_into(&mut writer, result);
    debug_assert_eq!(
        writer.finished_len(),
        size,
        "estimate_size and encode_into disagree on payload size"
    );
    // Re-borrow the slice — the cursor consumed the &mut [u8] but the
    // bytes themselves live in `bump`, so we can hand out a fresh slice
    // over the same range.
    let ptr_len = (writer.buf.as_mut_ptr(), size);
    drop(writer);
    // SAFETY: ptr came from `alloc_slice_fill_copy` and points into
    // `bump`, which has lifetime `'bump`. `size` matches the original
    // slice length.
    unsafe { std::slice::from_raw_parts_mut(ptr_len.0, ptr_len.1) }
}

#[cfg(test)]
mod bump_tests {
    use super::*;
    use crate::compiler::{CompileMetadata, CompileOutput};

    #[test]
    fn bump_encoder_matches_vec_encoder() {
        let result = CompileResult {
            js: CompileOutput {
                code: "let x = 1;".to_string(),
                map: Some(r#"{"version":3,"sources":["App.svelte"]}"#.to_string()),
            },
            css: None,
            warnings: vec![],
            metadata: CompileMetadata { runes: true },
            ast: None,
        };

        let via_vec = encode_to_vec(&result);
        let bump = bumpalo::Bump::with_capacity(estimate_size(&result));
        let via_bump = encode_into_bump(&bump, &result);
        assert_eq!(via_vec.as_slice(), &via_bump[..]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::{CompileMetadata, CompileOutput, CssOutput};

    fn round_trip_header(buf: &[u8]) {
        assert!(buf.len() >= HEADER_LEN);
        let read_u32 = |o: usize| {
            u32::from_le_bytes([buf[o], buf[o + 1], buf[o + 2], buf[o + 3]])
        };
        assert_eq!(read_u32(0), MAGIC, "magic mismatch");
        assert_eq!(read_u32(4), VERSION);
        assert_eq!(read_u32(8) as usize, buf.len(), "total_len mismatch");
    }

    fn read_str_at(buf: &[u8], off: u32, len: u32) -> &str {
        let start = off as usize;
        let end = start + len as usize;
        std::str::from_utf8(&buf[start..end]).expect("invalid utf-8 in envelope")
    }

    #[test]
    fn empty_compile_roundtrips() {
        let result = CompileResult {
            js: CompileOutput {
                code: "export default {};".to_string(),
                map: None,
            },
            css: None,
            warnings: vec![],
            metadata: CompileMetadata { runes: false },
            ast: None,
        };
        let buf = encode_to_vec(&result);
        round_trip_header(&buf);

        let read_u32 = |o: usize| {
            u32::from_le_bytes([buf[o], buf[o + 1], buf[o + 2], buf[o + 3]])
        };
        // js.code slot
        let code = read_str_at(&buf, read_u32(16), read_u32(20));
        assert_eq!(code, "export default {};");
        // js.map should be empty (offset 0, len 0)
        assert_eq!(read_u32(24), 0);
        assert_eq!(read_u32(28), 0);
        // flags
        assert_eq!(read_u32(12), 0);
    }

    #[test]
    fn full_compile_roundtrips() {
        let result = CompileResult {
            js: CompileOutput {
                code: "code".to_string(),
                map: Some(r#"{"version":3}"#.to_string()),
            },
            css: Some(CssOutput {
                code: ".x{}".to_string(),
                map: Some(r#"{"version":3,"file":"x"}"#.to_string()),
                has_global: true,
            }),
            warnings: vec![Warning {
                code: "a11y_no_x".to_string(),
                message: "bad".to_string(),
                filename: Some("App.svelte".to_string()),
                start: Some(Position {
                    line: 2,
                    column: 3,
                    character: 17,
                }),
                end: Some(Position {
                    line: 2,
                    column: 8,
                    character: 22,
                }),
                frame: None,
            }],
            metadata: CompileMetadata { runes: true },
            ast: None,
        };
        let buf = encode_to_vec(&result);
        round_trip_header(&buf);

        let read_u32 = |o: usize| {
            u32::from_le_bytes([buf[o], buf[o + 1], buf[o + 2], buf[o + 3]])
        };
        assert_eq!(
            read_u32(12),
            FLAG_HAS_CSS | FLAG_RUNES | FLAG_CSS_HAS_GLOBAL
        );
        assert_eq!(read_str_at(&buf, read_u32(16), read_u32(20)), "code");
        assert_eq!(read_str_at(&buf, read_u32(24), read_u32(28)), r#"{"version":3}"#);
        assert_eq!(read_str_at(&buf, read_u32(32), read_u32(36)), ".x{}");
        assert_eq!(
            read_str_at(&buf, read_u32(40), read_u32(44)),
            r#"{"version":3,"file":"x"}"#
        );
        assert_eq!(read_u32(52), 1, "one warning");
    }

    #[test]
    fn size_estimate_is_exact() {
        let result = CompileResult {
            js: CompileOutput {
                code: "a".repeat(1000),
                map: Some("b".repeat(500)),
            },
            css: Some(CssOutput {
                code: "c".repeat(200),
                map: None,
                has_global: false,
            }),
            warnings: vec![Warning {
                code: "w".to_string(),
                message: "m".to_string(),
                filename: None,
                start: None,
                end: None,
                frame: None,
            }],
            metadata: CompileMetadata { runes: false },
            ast: None,
        };
        let estimated = estimate_size(&result);
        let actual = encode_to_vec(&result).len();
        assert_eq!(estimated, actual, "size estimate must match actual");
    }
}
