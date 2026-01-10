//! Integration tests for CSS printing functionality.
//!
//! This file contains tests that verify CSS printing works correctly
//! by parsing a complete Svelte component and printing the CSS.

#[cfg(test)]
mod tests {
    use crate::ParseOptions;
    use crate::compiler::print::print;

    #[test]
    fn test_print_simple_css_rule() {
        let source = r#"
<h1>Hello</h1>

<style>
div {
  color: red;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        // Check that the CSS is printed
        assert!(result.code.contains("<style>"));
        assert!(result.code.contains("div {"));
        assert!(result.code.contains("color: red;"));
        assert!(result.code.contains("</style>"));
    }

    #[test]
    fn test_print_css_with_class_selector() {
        let source = r#"
<div class="test">Hello</div>

<style>
.test {
  font-size: 16px;
  font-weight: bold;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains(".test {"));
        assert!(result.code.contains("font-size: 16px;"));
        assert!(result.code.contains("font-weight: bold;"));
    }

    #[test]
    fn test_print_css_with_pseudo_class() {
        let source = r#"
<button>Click me</button>

<style>
button:hover {
  background: blue;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains("button:hover {"));
        assert!(result.code.contains("background: blue;"));
    }

    #[test]
    fn test_print_css_with_media_query() {
        let source = r#"
<div>Responsive</div>

<style>
@media screen and (min-width: 768px) {
  div {
    width: 50%;
  }
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains("@media screen and (min-width: 768px)"));
        assert!(result.code.contains("div {"));
        assert!(result.code.contains("width: 50%;"));
    }

    #[test]
    fn test_print_css_with_multiple_selectors() {
        let source = r#"
<div>Content</div>

<style>
h1,
h2,
h3 {
  margin: 0;
  padding: 0;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        // The output might format selectors differently, but all should be present
        assert!(result.code.contains("h1"));
        assert!(result.code.contains("h2"));
        assert!(result.code.contains("h3"));
        assert!(result.code.contains("margin: 0;"));
        assert!(result.code.contains("padding: 0;"));
    }

    #[test]
    fn test_print_css_with_attribute_selector() {
        let source = r#"
<input type="text" />

<style>
input[type="text"] {
  border: 1px solid gray;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains("input"));
        assert!(result.code.contains("[type=\"text\"]"));
        assert!(result.code.contains("border: 1px solid gray;"));
    }

    #[test]
    fn test_print_css_with_descendant_combinator() {
        let source = r#"
<div><p>Text</p></div>

<style>
div p {
  line-height: 1.5;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains("div p {"));
        assert!(result.code.contains("line-height: 1.5;"));
    }

    #[test]
    fn test_print_css_with_child_combinator() {
        let source = r#"
<ul><li>Item</li></ul>

<style>
ul > li {
  list-style: none;
}
</style>
"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();

        assert!(result.code.contains("ul > li {"));
        assert!(result.code.contains("list-style: none;"));
    }
}
