use super::*;

#[test]
fn strips_the_first_lines_indentation_from_each_line() {
    let source = "<script>\n\t/* a\n\t   b\n\t*/\n</script>";
    let start = source.find("/*").unwrap() as u32;
    let end = source.find("*/").unwrap() as u32 + 2;
    let comment = Comment::new(source, Span::new(start, end), true, 9);
    assert_eq!(comment.value, " a\n   b\n");
}

#[test]
fn counts_the_text_before_a_script_as_spaces() {
    let source = "<script>/* a\n         b */</script>";
    let start = source.find("/*").unwrap() as u32;
    let end = source.find("*/").unwrap() as u32 + 2;
    let comment = Comment::new(source, Span::new(start, end), true, 8);
    assert_eq!(comment.value, " a\n b ");
}
