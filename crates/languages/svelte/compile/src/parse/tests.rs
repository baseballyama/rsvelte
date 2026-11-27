use super::*;

fn syntax_tree(source: &str) -> String {
    parse(source).expect("parses")
}

#[test]
fn a_later_script_takes_the_comments_read_before_it() {
    let json = syntax_tree("<script module>/* m */ let x;</script>\n<script>let a;</script>");
    let instance = &json[json.find("\"instance\"").expect("an instance")..];
    assert!(instance.contains("\"leadingComments\":[{\"type\":\"Block\",\"value\":\" m \""));
}

#[test]
fn a_byte_order_mark_moves_no_position() {
    assert_eq!(syntax_tree("\u{feff}<p></p>"), syntax_tree("<p></p>"));
}
