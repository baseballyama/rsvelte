//! Context for building formatted output.
//!
//! This module implements the Context structure that mirrors the esrap Context API
//! from the official Svelte compiler. The Context is responsible for:
//!
//! - Building the output string with proper formatting
//! - Managing indentation levels
//! - Tracking source map mappings
//! - Measuring output length for formatting decisions
//!
//! Reference: esrap npm package Context API

use oxc_allocator::Allocator;

/// Default indentation string (1 tab, as per Svelte's print output).
const INDENT_STRING: &str = "\t";

/// Context for building formatted output.
///
/// This structure mirrors the esrap Context API and provides methods for:
/// - Writing text to the output buffer
/// - Managing indentation
/// - Creating child contexts
/// - Measuring output length
pub struct Context<'a> {
    /// The allocator for string allocations
    #[allow(dead_code)]
    allocator: &'a Allocator,
    /// The output buffer
    buffer: String,
    /// Current indentation level
    indent_level: usize,
    /// Whether we're at the start of a new line
    at_line_start: bool,
    /// Whether the context contains multiline content
    pub multiline: bool,
    /// Original source text for faithful reproduction of expressions/scripts.
    pub source: Option<&'a str>,
    /// Deferred newline flag (like esrap's needs_newline)
    needs_newline: bool,
    /// Deferred margin flag (like esrap's needs_margin)
    needs_margin: bool,
    /// Source map mappings (line, column) -> (original_line, original_column)
    /// TODO: Implement proper source map support
    #[allow(dead_code)]
    mappings: Vec<(usize, usize, usize, usize)>,
}

impl<'a> Context<'a> {
    /// Create a new Context.
    ///
    /// # Arguments
    ///
    /// * `allocator` - The allocator to use for string allocations
    pub fn new(allocator: &'a Allocator) -> Self {
        Self {
            allocator,
            buffer: String::new(),
            indent_level: 0,
            at_line_start: true,
            multiline: false,
            source: None,
            needs_newline: false,
            needs_margin: false,
            mappings: Vec::new(),
        }
    }

    /// Create a new Context with source text.
    pub fn new_with_source(allocator: &'a Allocator, source: Option<&'a str>) -> Self {
        Self {
            allocator,
            buffer: String::new(),
            indent_level: 0,
            at_line_start: true,
            multiline: false,
            source,
            needs_newline: false,
            needs_margin: false,
            mappings: Vec::new(),
        }
    }

    /// Write a string to the output buffer.
    ///
    /// If we're at the start of a line, indentation will be added automatically.
    ///
    /// # Arguments
    ///
    /// * `text` - The text to write
    pub fn write(&mut self, text: &str) {
        if text.is_empty() {
            return;
        }

        // Flush deferred newline/margin before writing content
        if self.needs_newline {
            if self.needs_margin {
                // margin + newline = blank line + new indented line
                self.buffer.push('\n');
            }
            self.buffer.push('\n');
            self.at_line_start = true;
            self.multiline = true;
            self.needs_newline = false;
            self.needs_margin = false;
        }

        // Add indentation if at line start
        if self.at_line_start && !text.starts_with('\n') {
            for _ in 0..self.indent_level {
                self.buffer.push_str(INDENT_STRING);
            }
            self.at_line_start = false;
        }

        self.buffer.push_str(text);
    }

    /// Write a formatted string to the output buffer.
    ///
    /// This is a convenience method for writing formatted text.
    ///
    /// # Arguments
    ///
    /// * `args` - The format arguments
    #[allow(dead_code)]
    pub fn write_fmt(&mut self, args: std::fmt::Arguments<'_>) {
        let s = args.to_string();
        self.write(&s);
    }

    /// Add a newline to the output.
    ///
    /// Uses deferred processing like esrap: the actual newline is written
    /// when the next content is written via write().
    pub fn newline(&mut self) {
        // If there's already a deferred newline that hasn't been flushed,
        // flush it now (this happens for consecutive newlines)
        if self.needs_newline {
            if self.needs_margin {
                self.buffer.push('\n');
                self.needs_margin = false;
            }
            self.buffer.push('\n');
            self.at_line_start = true;
            self.multiline = true;
        }
        self.needs_newline = true;
    }

    /// Increase the indentation level.
    ///
    /// Typically called before adding a newline.
    pub fn indent(&mut self) {
        self.indent_level += 1;
    }

    /// Decrease the indentation level.
    ///
    /// Typically called before adding a newline.
    pub fn dedent(&mut self) {
        if self.indent_level > 0 {
            self.indent_level -= 1;
        }
    }

    /// Add a margin (blank line) to the output.
    ///
    /// Matches esrap's deferred margin behavior:
    /// `margin(); newline()` creates a blank line between sections.
    /// The margin flag is consumed when the deferred newline is flushed.
    pub fn margin(&mut self) {
        self.needs_margin = true;
    }

    /// Measure the length of the current output.
    ///
    /// Returns the number of characters in the buffer.
    /// This is useful for making formatting decisions (e.g., inline vs multiline).
    pub fn measure(&self) -> usize {
        self.buffer.len()
    }

    /// Check if the context is empty.
    ///
    /// Returns true if the buffer contains no content and no deferred writes.
    pub fn empty(&self) -> bool {
        self.buffer.is_empty() && !self.needs_newline
    }

    /// Append another context to this one.
    ///
    /// This copies the content from the other context into this one.
    /// The multiline flag is updated if the other context is multiline.
    ///
    /// # Arguments
    ///
    /// * `other` - The context to append
    pub fn append(&mut self, other: &Context) {
        if other.buffer.is_empty() && !other.needs_newline {
            return;
        }

        // Flush our deferred newlines before appending content
        if self.needs_newline && !other.buffer.is_empty() {
            if self.needs_margin {
                self.buffer.push('\n');
            }
            self.buffer.push('\n');
            self.at_line_start = true;
            self.multiline = true;
            self.needs_newline = false;
            self.needs_margin = false;
        }

        // Add indentation for each line in the other context
        let indent = INDENT_STRING.repeat(self.indent_level);
        for (i, line) in other.buffer.split('\n').enumerate() {
            if i > 0 {
                self.buffer.push('\n');
            }
            // Add indentation at line start
            if ((i == 0 && self.at_line_start) || i > 0) && !line.is_empty() {
                self.buffer.push_str(&indent);
            }
            self.buffer.push_str(line);
        }
        self.at_line_start = other.buffer.ends_with('\n');
        if other.multiline {
            self.multiline = true;
        }

        // Inherit deferred state from the other context
        if other.needs_newline {
            self.needs_newline = true;
            self.multiline = true;
        }
        if other.needs_margin {
            self.needs_margin = true;
        }
    }

    /// Create a new child context.
    ///
    /// The child context shares the same allocator but has its own buffer
    /// and starts with zero indentation.
    pub fn child(&self) -> Context<'a> {
        Context {
            allocator: self.allocator,
            buffer: String::new(),
            indent_level: 0,
            at_line_start: true,
            multiline: false,
            source: self.source,
            needs_newline: false,
            needs_margin: false,
            mappings: Vec::new(),
        }
    }

    /// Add a source map location mapping.
    ///
    /// This records a mapping from the generated code position to the original source position.
    /// TODO: Implement proper source map generation.
    ///
    /// # Arguments
    ///
    /// * `line` - The line number in the original source (1-indexed)
    /// * `column` - The column number in the original source (0-indexed)
    #[allow(dead_code)]
    pub fn location(&mut self, line: usize, column: usize) {
        let current_line = self.buffer.lines().count();
        let current_column = self.buffer.lines().last().map(|l| l.len()).unwrap_or(0);
        self.mappings
            .push((current_line, current_column, line, column));
    }

    /// Flush any deferred newlines to the buffer.
    fn flush_deferred(&mut self) {
        if self.needs_newline {
            if self.needs_margin {
                self.buffer.push('\n');
            }
            self.buffer.push('\n');
            self.at_line_start = true;
            self.multiline = true;
            self.needs_newline = false;
            self.needs_margin = false;
        }
    }

    /// Get the buffer content as a string.
    ///
    /// Returns the complete output buffer.
    pub fn finish(mut self) -> String {
        self.flush_deferred();
        self.buffer
    }

    /// Get a reference to the buffer content.
    ///
    /// Returns the complete output buffer as a string slice.
    pub fn as_str(&self) -> &str {
        &self.buffer
    }

    /// Get the source map as a JSON string.
    ///
    /// TODO: Implement proper source map generation using the sourcemap crate.
    /// For now, returns None.
    pub fn get_source_map(&self) -> Option<String> {
        // TODO: Generate proper source map from self.mappings
        None
    }
}

impl<'a> std::fmt::Display for Context<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.buffer)?;
        // Flush deferred newlines in display
        if self.needs_newline {
            if self.needs_margin {
                writeln!(f)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;

    #[test]
    fn test_context_write() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        ctx.write("hello");
        assert_eq!(ctx.to_string(), "hello");
    }

    #[test]
    fn test_context_newline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        ctx.write("line1");
        ctx.newline();
        ctx.write("line2");
        assert_eq!(ctx.to_string(), "line1\nline2");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_context_indent() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        ctx.write("line1");
        ctx.newline();
        ctx.indent();
        ctx.write("line2");
        assert_eq!(ctx.to_string(), "line1\n\tline2");
    }

    #[test]
    fn test_context_dedent() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        ctx.indent();
        ctx.write("line1");
        ctx.newline();
        ctx.dedent();
        ctx.write("line2");
        assert_eq!(ctx.to_string(), "\tline1\nline2");
    }

    #[test]
    fn test_context_measure() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        assert_eq!(ctx.measure(), 0);
        ctx.write("test");
        assert_eq!(ctx.measure(), 4);
    }

    #[test]
    fn test_context_empty() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        assert!(ctx.empty());
        ctx.write("test");
        assert!(!ctx.empty());
    }

    #[test]
    fn test_context_append() {
        let allocator = Allocator::default();
        let mut ctx1 = Context::new(&allocator);
        let mut ctx2 = Context::new(&allocator);

        ctx1.write("hello");
        ctx2.write("world");
        ctx2.newline();

        ctx1.append(&ctx2);
        assert_eq!(ctx1.to_string(), "helloworld\n");
        assert!(ctx1.multiline);
    }

    #[test]
    fn test_context_child() {
        let allocator = Allocator::default();
        let ctx1 = Context::new(&allocator);
        let mut ctx2 = ctx1.child();

        ctx2.write("child content");
        assert_eq!(ctx2.to_string(), "child content");
        assert_eq!(ctx1.to_string(), ""); // Parent unchanged
    }

    #[test]
    fn test_context_multiple_indent_levels() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        ctx.write("level0");
        ctx.newline();
        ctx.indent();
        ctx.write("level1");
        ctx.newline();
        ctx.indent();
        ctx.write("level2");
        ctx.newline();
        ctx.dedent();
        ctx.write("level1");
        ctx.newline();
        ctx.dedent();
        ctx.write("level0");

        assert_eq!(
            ctx.to_string(),
            "level0\n\tlevel1\n\t\tlevel2\n\tlevel1\nlevel0"
        );
    }
}
