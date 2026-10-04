use std::io::Write;

use rsvelte_stylesheet::syntax_tree::{
    ComplexSelector, Declaration, RelativeSelector, Rule, Simple, SimpleList, StyleSheet,
};

fn main() -> std::io::Result<()> {
    let mut output = std::io::stdout().lock();
    for (name, size, alignment) in [
        (
            "StyleSheet",
            size_of::<StyleSheet>(),
            align_of::<StyleSheet>(),
        ),
        ("Rule", size_of::<Rule>(), align_of::<Rule>()),
        (
            "Declaration",
            size_of::<Declaration>(),
            align_of::<Declaration>(),
        ),
        (
            "ComplexSelector",
            size_of::<ComplexSelector>(),
            align_of::<ComplexSelector>(),
        ),
        (
            "RelativeSelector",
            size_of::<RelativeSelector>(),
            align_of::<RelativeSelector>(),
        ),
        ("Simple", size_of::<Simple>(), align_of::<Simple>()),
        (
            "SimpleList",
            size_of::<SimpleList>(),
            align_of::<SimpleList>(),
        ),
        (
            "OwnedEdit",
            size_of::<(u32, u32, String)>(),
            align_of::<(u32, u32, String)>(),
        ),
        (
            "BorrowedEdit",
            size_of::<(u32, u32, &str)>(),
            align_of::<(u32, u32, &str)>(),
        ),
    ] {
        writeln!(output, "{name}\t{size}\t{alignment}")?;
    }
    Ok(())
}
