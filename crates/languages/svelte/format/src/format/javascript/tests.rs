use crate::format::{format, rejected};
use crate::options::Options;

fn formatted(source_text: &str) -> String {
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    format(
        &c,
        source_text,
        &Options::default(),
        rejected(&c, source_text).as_ref(),
    )
    .expect("prints")
}

#[test]
fn await_is_an_operator_in_a_script_and_in_the_template() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("<script lang=\"ts\">\nconst r = await\np;\n</script>\n"),
        "<script lang=\"ts\">\n  const r = await p;\n</script>\n"
    );
    assert_eq!(
        formatted("<script>\nconst r = await\np;\n</script>\n"),
        "<script>\n  const r = await p;\n</script>\n"
    );
    assert_eq!(
        formatted("<script lang=\"ts\"></script>\n{await a}\n"),
        "<script lang=\"ts\"></script>\n\n{await a}\n"
    );
}
