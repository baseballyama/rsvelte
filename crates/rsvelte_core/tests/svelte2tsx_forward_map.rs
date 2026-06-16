//! `Svelte2TsxResult::map_offset_forward` must land byte-exactly on a
//! verbatim-copied `<script>` expression in the generated TSX. This is the
//! forward-mapping primitive type-aware lint rules use to place a
//! `get_type_at_position` probe on the original expression's generated copy.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> rsvelte_core::svelte2tsx::Svelte2TsxResult {
    let opts = Svelte2TsxOptions {
        filename: "Fwd.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx")
}

#[test]
fn forward_map_lands_on_script_identifier() {
    let src = r#"<script lang="ts">
  import { goto } from '$app/navigation';
  let path = '/x';
  function nav() { goto(path); }
</script>
"#;
    // The `path` argument inside `goto(path)`.
    let call = src.find("goto(path)").unwrap();
    let arg_off = (call + "goto(".len()) as u32;
    assert_eq!(&src[arg_off as usize..arg_off as usize + 4], "path");

    let res = convert(src);
    let g = res
        .map_offset_forward(arg_off)
        .expect("offset should map forward into a verbatim chunk") as usize;

    // The generated offset must point at the verbatim copy of `path`.
    assert_eq!(
        &res.code[g..g + 4],
        "path",
        "forward-mapped offset should land on the copied identifier; got:\n{}",
        &res.code[g.saturating_sub(10)..usize::min(res.code.len(), g + 14)]
    );
}

#[test]
fn forward_map_is_none_for_synthesized_region() {
    let src = "<script lang=\"ts\">\n  let a = 1;\n</script>\n";
    let res = convert(src);
    // Offset 0 is the `<` of `<script>` — blanked/synthesized, no verbatim copy.
    assert_eq!(res.map_offset_forward(0), None);
}
