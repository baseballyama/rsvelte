//! How `PostCSS` reads a declaration, and `postcss-scss` a nested property.

use rsvelte_kernel::source::characters::trim_ecmascript;
use rsvelte_kernel::source::positions::Span;

use super::{Declaration, InlineNode, Kind, Parser, R, Token, thrown};

impl Parser<'_> {
    /// `postcss-scss`'s nested property (`font: 12px {`): where its block starts, or `None` for a
    /// rule. Only its missed-semicolon check throws.
    pub(super) fn nested_declaration(&self, tokens: &[Token]) -> R<Option<u32>> {
        let mut colon = None;
        let mut depth = 0i32;
        for (i, token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Space if self.text(*token).contains('\n') => break,
                Kind::Open(b'(') => depth += 1,
                Kind::Close(b')') => depth -= 1,
                Kind::Colon if depth == 0 => {
                    colon = Some(i);
                    break;
                }
                _ => {}
            }
        }
        let Some(colon) = colon else {
            return Ok(None);
        };
        let mut value = tokens[colon + 1..]
            .iter()
            .filter(|t| !matches!(t.kind, Kind::Comment | Kind::InlineComment))
            .map(|t| self.text(*t));
        let mut blank = true;
        let mut first = None;
        for text in value.by_ref() {
            first = first.or_else(|| text.bytes().next());
            if !trim_ecmascript(text).is_empty() {
                blank = false;
                break;
            }
        }
        if blank
            || first.is_some_and(|c| c == b'#' || c == b':' || c == b'-' || c.is_ascii_alphabetic())
        {
            return Ok(None);
        }
        // Upstream reads the property from the first word, wherever the colon was.
        let Some(word) = tokens.iter().position(|t| t.kind == Kind::Word) else {
            // Upstream throws a `TypeError` here; read it as a rule.
            return Ok(None);
        };
        let start = tokens[word].start;
        let rest = &tokens[word..];
        let property_end = rest
            .iter()
            .position(|t| {
                matches!(
                    t.kind,
                    Kind::Colon | Kind::Space | Kind::Comment | Kind::InlineComment
                )
            })
            .unwrap_or(rest.len());
        let rest = &rest[property_end..];
        let rest = rest
            .iter()
            .position(|t| t.kind == Kind::Colon)
            .map_or(&[][..], |at| &rest[at + 1..]);
        let first_value = rest
            .iter()
            .position(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment))
            .unwrap_or(rest.len());
        let rest = &rest[first_value..];
        let rest = &rest[..self.nested_important(rest)];
        if self.raw_value(rest, false).contains(':') {
            self.missed_semicolon(rest)?;
        }
        Ok(Some(start))
    }

    /// How many tokens stay once a nested property's `!important` is removed: `postcss-scss`
    /// matches it case-sensitively and never at the first token.
    pub(super) fn nested_important(&self, tokens: &[Token]) -> usize {
        for i in (1..tokens.len()).rev() {
            let token = tokens[i];
            let text = self.text(token);
            if text == "!important" {
                let mut cut = i;
                while cut > 0 && tokens[cut - 1].kind == Kind::Space {
                    cut -= 1;
                }
                return cut;
            }
            if text == "important" {
                let mut cut = tokens.len();
                let mut text = String::new();
                for j in (1..=i).rev() {
                    if trim_ecmascript(&text).starts_with('!') && tokens[j].kind != Kind::Space {
                        break;
                    }
                    cut -= 1;
                    text.insert_str(0, self.text(tokens[cut]));
                }
                if trim_ecmascript(&text).starts_with('!') {
                    return cut;
                }
            }
            if !matches!(
                token.kind,
                Kind::Space | Kind::Comment | Kind::InlineComment
            ) {
                break;
            }
        }
        tokens.len()
    }

    /// `a: b c: d` in safe mode is two declarations, each read in turn, not one inside the other.
    pub(super) fn declaration(&mut self, tokens: &[Token], custom_property: bool) -> R<()> {
        let mut next = Some(tokens);
        let mut custom_property = custom_property;
        while let Some(tokens) = next {
            next = self.one_declaration(tokens, custom_property)?;
            custom_property = false;
        }
        Ok(())
    }

    /// Reads one declaration; returns the tokens `postcss-safe-parser` splits off after it.
    pub(super) fn one_declaration<'t>(
        &mut self,
        tokens: &'t [Token],
        custom_property: bool,
    ) -> R<Option<&'t [Token]>> {
        if !self.strict() && (tokens.len() < 2 || !tokens.iter().any(|t| t.kind == Kind::Word)) {
            return Ok(None);
        }
        let last = *tokens.last().expect("a declaration has tokens");
        let tokens = if last.kind == Kind::Semicolon {
            &tokens[..tokens.len() - 1]
        } else {
            tokens
        };
        let end = if last.kind == Kind::Space {
            tokens
                .iter()
                .rev()
                .find(|t| t.kind != Kind::Space)
                .map_or(last.end, |t| t.recorded_end)
        } else {
            last.recorded_end
        };
        let mut rest = tokens;
        while rest[0].kind != Kind::Word {
            if rest.len() == 1 {
                return self.unknown_word(rest).map(|()| None);
            }
            rest = &rest[1..];
        }
        let start = rest[0].start;
        let (property, after_colon, rest) = self.property(rest)?;
        let first_value = rest
            .iter()
            .position(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment))
            .unwrap_or(rest.len());
        let (first_spaces, mut value) = (&rest[..first_value], &rest[first_value..]);
        let split = if self.strict() {
            None
        } else {
            self.split_missed_semicolon(value)?.map(|(before, after)| {
                value = before;
                after
            })
        };
        let (kept, important) = self.important(value);
        let value = &value[..kept];
        let has_word = value
            .iter()
            .any(|t| !matches!(t.kind, Kind::Space | Kind::Comment | Kind::InlineComment));
        if self.strict() {
            if !custom_property && self.raw_value(value, custom_property).contains(':') {
                self.missed_semicolon(value)?;
            }
            return Ok(None);
        }
        let value_span = if has_word {
            let last = value
                .iter()
                .rposition(|t| t.kind != Kind::Space)
                .expect("a value with a word");
            Span::new(value[0].start, value[last].end)
        } else {
            match (
                first_spaces.first().or_else(|| value.first()),
                value.last().or_else(|| first_spaces.last()),
            ) {
                (Some(first), Some(last)) => Span::new(first.start, last.end),
                _ => Span::new(after_colon, after_colon),
            }
        };
        let written = if has_word {
            value
        } else {
            &rest[..first_value + value.len()]
        };
        let cleaned = self.raw_value(written, custom_property);
        let declaration = InlineNode::Declaration(Declaration {
            span: Span::new(start, end),
            property,
            value: value_span,
            cleaned_value: (cleaned != value_span.text(self.source)).then(|| cleaned.into()),
            important,
            property_holes: 0,
            other_holes: 0,
        });
        self.nodes.push(declaration);
        Ok(split)
    }

    /// The property from the first word, where its value starts, and the tokens after the `:`.
    pub(super) fn property<'t>(&self, tokens: &'t [Token]) -> R<(Span, u32, &'t [Token])> {
        let start = tokens[0].start;
        let property_end = tokens
            .iter()
            .position(|t| {
                matches!(
                    t.kind,
                    Kind::Colon | Kind::Space | Kind::Comment | Kind::InlineComment
                )
            })
            .unwrap_or(tokens.len());
        let mut property = Span::new(start, tokens[property_end - 1].end);
        if matches!(self.b[start as usize], b'_' | b'*') {
            property.start_offset += 1;
        }
        let mut rest = &tokens[property_end..];
        let mut after_colon = property.end_offset;
        while let Some((&token, after)) = rest.split_first() {
            rest = after;
            after_colon = token.end;
            if token.kind == Kind::Colon {
                break;
            }
            if token.kind == Kind::Word
                && self
                    .text(token)
                    .bytes()
                    .any(|c| c.is_ascii_alphanumeric() || c == b'_')
            {
                self.unknown_word(&[token])?;
            }
        }
        Ok((property, after_colon, rest))
    }

    /// `postcss-safe-parser`'s `precheckMissedSemicolon`: the value of `a: b c: d` splits into
    /// `b` and the declaration `c: d`.
    pub(super) fn split_missed_semicolon<'t>(
        &self,
        tokens: &'t [Token],
    ) -> R<Option<(&'t [Token], &'t [Token])>> {
        let Some(colon) = self.colon(tokens)? else {
            return Ok(None);
        };
        let Some(next_start) = tokens[..colon].iter().rposition(|t| t.kind == Kind::Word) else {
            return Ok(None);
        };
        if next_start == 0 {
            return Ok(None);
        }
        let previous_end = tokens[..next_start]
            .iter()
            .rposition(|t| t.kind != Kind::Space)
            .map_or(0, |i| i + 1);
        Ok(Some((&tokens[..previous_end], &tokens[next_start..])))
    }

    /// How many tokens stay once a trailing `!important` is removed, and whether there was one.
    pub(super) fn important(&self, tokens: &[Token]) -> (usize, bool) {
        let mut kept = tokens.len();
        let mut important = false;
        for i in (0..tokens.len()).rev() {
            let token = tokens[i];
            let text = self.text(token);
            if text.eq_ignore_ascii_case("!important") {
                let mut cut = i;
                while cut > 0 && tokens[cut - 1].kind == Kind::Space {
                    cut -= 1;
                }
                return (cut, true);
            }
            if text.eq_ignore_ascii_case("important") {
                // As upstream, the text before is rebuilt from the end; its cost matches
                // upstream's.
                let mut cut = kept;
                let mut text = String::new();
                for j in (1..=i).rev() {
                    if text.trim().starts_with('!') && tokens[j].kind != Kind::Space {
                        break;
                    }
                    cut -= 1;
                    text.insert_str(0, self.text(tokens[cut]));
                }
                if text.trim().starts_with('!') {
                    kept = cut;
                    important = true;
                }
            }
            if !matches!(
                token.kind,
                Kind::Space | Kind::Comment | Kind::InlineComment
            ) {
                break;
            }
        }
        (kept, important)
    }

    /// `Parser#raw`'s cleaned value: comments next to nothing or spaces, and a last space, dropped.
    pub(super) fn raw_value(&self, tokens: &[Token], custom_property: bool) -> String {
        let mut value = String::new();
        let neighbour_is_safe = |i: Option<&Token>| i.is_none_or(|t| t.kind == Kind::Space);
        for (i, token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Space if i == tokens.len() - 1 && !custom_property => {}
                Kind::Comment | Kind::InlineComment => {
                    let before = i.checked_sub(1).and_then(|p| tokens.get(p));
                    if !neighbour_is_safe(before)
                        && !neighbour_is_safe(tokens.get(i + 1))
                        && !value.ends_with(',')
                    {
                        value.push_str(self.text(*token));
                    }
                }
                _ => value.push_str(self.text(*token)),
            }
        }
        value
    }

    /// `Parser#colon`: the first `:` outside parentheses, after something.
    pub(super) fn colon(&self, tokens: &[Token]) -> R<Option<usize>> {
        let mut depth = 0i32;
        let mut previous: Option<Token> = None;
        for (i, &token) in tokens.iter().enumerate() {
            match token.kind {
                Kind::Open(b'(') => depth += 1,
                Kind::Close(b')') => depth -= 1,
                _ => {}
            }
            if depth == 0 && token.kind == Kind::Colon {
                match previous {
                    None if self.strict() => return thrown("Double colon", token.start),
                    None => {}
                    Some(p) if p.kind == Kind::Word && self.text(p) == "progid" => continue,
                    Some(_) => return Ok(Some(i)),
                }
            }
            previous = Some(token);
        }
        Ok(None)
    }

    pub(super) fn missed_semicolon(&self, tokens: &[Token]) -> R<()> {
        let Some(colon) = self.colon(tokens)? else {
            return Ok(());
        };
        let mut found = 0;
        let mut token = tokens[colon];
        for j in (0..colon).rev() {
            token = tokens[j];
            if token.kind != Kind::Space {
                found += 1;
                if found == 2 {
                    break;
                }
            }
        }
        let offset = if token.kind == Kind::Word {
            Self::last_offset(token) + 1
        } else {
            token.start
        };
        thrown("Missed semicolon", offset)
    }

    /// Where a token's last character is, as the tokenizer records it.
    pub(super) const fn last_offset(token: Token) -> u32 {
        token.recorded_end - 1
    }
}
