use rsvelte_kernel::output::emitter::{Atom, Mapping};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;

const VERBATIM: u32 = 0;
const ATOM: u32 = 1;

/// Copies as verbatim segments and atoms as atom segments, in generated order, as native
/// TypeScript's span map requires.
pub fn write_mappings(mappings: &[Mapping], atoms: &[Atom], output: &mut StructuredDataWriter) {
    output.key("mappings").begin_array();
    // Point mappings have no range and cannot make generated helpers appear source-authored.
    let copies = mappings
        .iter()
        .filter(|mapping| mapping.len > 0)
        .map(|m| [m.generated, m.len, m.source_text, m.len, VERBATIM]);
    let atoms = atoms.iter().map(|a| {
        [
            a.generated.start_offset,
            a.generated.len(),
            a.original.start_offset,
            a.original.len(),
            ATOM,
        ]
    });
    let mut copies = copies.peekable();
    let mut atoms = atoms.peekable();
    loop {
        let segment = match (copies.peek(), atoms.peek()) {
            (Some(copy), Some(atom)) if atom[0] < copy[0] => atoms.next(),
            (Some(_), _) => copies.next(),
            (None, _) => atoms.next(),
        };
        let Some(segment) = segment else { break };
        output.begin_array();
        for value in segment {
            output.write_number(value);
        }
        output.end_array();
    }
    output.end_array();
}
