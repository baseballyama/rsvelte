use super::{Attributes, Cow, Kind2, ROOT, STYLESHEET_DISPLAY, Span, Tree, is_markup_ws, only_ws};

impl Tree<'_> {
    /// `extractWhitespaces`: trims the text of every container that is not whitespace-sensitive
    /// (every one but `<script>` and `<style>`), recording where whitespace was.
    pub(super) fn extract_whitespace(&mut self) {
        for i in 0..self.n.len() {
            if self.is_script_like(i) || matches!(self.n[i].kind, Kind2::Root) {
                continue;
            }
            let children = std::mem::take(&mut self.n[i].children);
            if children.len() == 1
                && let Kind2::Text(t) = &self.n[children[0]].kind
                && only_ws(t)
            {
                self.n[i].has.dangling = true;
                continue;
            }
            let mut out: Vec<usize> = Vec::with_capacity(children.len());
            let mut pending_leading = false;
            for (j, &k) in children.iter().enumerate() {
                if pending_leading {
                    self.n[k].has.leading = true;
                    pending_leading = false;
                }
                let Kind2::Text(text) = &self.n[k].kind else {
                    out.push(k);
                    continue;
                };
                let lead = text.len()
                    - text
                        .trim_start_matches(|c: char| c.is_ascii() && is_markup_ws(c as u8))
                        .len();
                let trimmed_end = text
                    .trim_end_matches(|c: char| c.is_ascii() && is_markup_ws(c as u8))
                    .len();
                if lead == text.len() {
                    if let Some(&p) = out.last() {
                        self.n[p].has.trailing = true;
                    }
                    pending_leading = j + 1 < children.len();
                    continue;
                }
                let trail = text.len() - trimmed_end;
                let value = match text {
                    Cow::Borrowed(s) => Cow::Borrowed(&s[lead..trimmed_end]),
                    Cow::Owned(s) => Cow::Owned(s[lead..trimmed_end].to_owned()),
                };
                let span = self.n[k].span;
                self.n[k].span = Span::new(
                    span.start_offset + u32::try_from(lead).expect("fits"),
                    span.end_offset - u32::try_from(trail).expect("fits"),
                );
                self.n[k].kind = Kind2::Text(value);
                if lead > 0 {
                    if let Some(&p) = out.last() {
                        self.n[p].has.trailing = true;
                    }
                    self.n[k].has.leading = true;
                }
                if trail > 0 {
                    self.n[k].has.trailing = true;
                    pending_leading = j + 1 < children.len();
                }
                out.push(k);
            }
            self.n[i].children = out;
        }
    }

    /// `addStylesheetDisplay` and `addIsSelfClosing`.
    pub(super) fn display_and_closing(&mut self) {
        for i in 1..self.n.len() {
            let display = match self.n[i].kind {
                Kind2::Element { .. } if self.n[i].parent == ROOT => "block",
                Kind2::Element { name, .. } => STYLESHEET_DISPLAY
                    .iter()
                    .find(|(t, _)| *t == name)
                    .map_or("inline", |(_, d)| d),
                _ => "inline",
            };
            self.n[i].display = display;
            if self.is_text(i) {
                self.n[i].self_closing = true;
            }
        }
    }

    pub(super) fn is_block_like(display: &str) -> bool {
        display == "block" || display == "list-item" || display.starts_with("table")
    }

    pub(super) fn is_leading_sensitive(&self, i: usize) -> bool {
        let n = &self.n[i];
        let texty = |j: usize| matches!(self.n[j].kind, Kind2::Text(_) | Kind2::Interpolation(_));
        if texty(i) && n.prev.is_some_and(texty) {
            return true;
        }
        let parent = &self.n[n.parent];
        if parent.display == "none" {
            return false;
        }
        if n.prev.is_none()
            && (n.parent == ROOT
                || self.is_script_like(n.parent)
                || Self::is_block_like(parent.display)
                || parent.display == "inline-block")
        {
            return false;
        }
        if let Some(p) = n.prev
            && Self::is_block_like(self.n[p].display)
        {
            return false;
        }
        true
    }

    pub(super) fn is_trailing_sensitive(&self, i: usize) -> bool {
        let n = &self.n[i];
        let texty = |j: usize| matches!(self.n[j].kind, Kind2::Text(_) | Kind2::Interpolation(_));
        if texty(i) && n.next.is_some_and(texty) {
            return true;
        }
        let parent = &self.n[n.parent];
        if parent.display == "none" {
            return false;
        }
        if n.next.is_none()
            && (n.parent == ROOT
                || self.is_script_like(n.parent)
                || Self::is_block_like(parent.display)
                || parent.display == "inline-block")
        {
            return false;
        }
        if let Some(x) = n.next
            && Self::is_block_like(self.n[x].display)
        {
            return false;
        }
        true
    }

    /// `addIsSpaceSensitive`.
    pub(super) fn space_sensitivity(&mut self) {
        for i in 0..self.n.len() {
            let children = self.n[i].children.clone();
            if children.is_empty() {
                let d = self.n[i].display;
                self.n[i].sensitive.dangling =
                    !Self::is_block_like(d) && d != "inline-block" && !self.is_script_like(i);
                continue;
            }
            for &k in &children {
                self.n[k].sensitive.leading = self.is_leading_sensitive(k);
                self.n[k].sensitive.trailing = self.is_trailing_sensitive(k);
            }
            for (j, &k) in children.iter().enumerate() {
                if j > 0 {
                    self.n[k].sensitive.leading =
                        self.n[children[j - 1]].sensitive.trailing && self.n[k].sensitive.leading;
                }
                if j + 1 < children.len() {
                    self.n[k].sensitive.trailing =
                        self.n[children[j + 1]].sensitive.leading && self.n[k].sensitive.trailing;
                }
            }
        }
    }

    /// `mergeSimpleElementIntoText`: `a<b>x</b>c` becomes one text.
    pub(super) fn merge_simple_elements(&mut self) {
        for i in 0..self.n.len() {
            let mut j = 0;
            while j < self.n[i].children.len() {
                let children = &self.n[i].children;
                let k = children[j];
                let simple = self.is_simple_element(k, j, children);
                if !simple {
                    j += 1;
                    continue;
                }
                let (prev, next) = (children[j - 1], children[j + 1]);
                let name = self.name(k).expect("an element");
                let inner = match &self.n[self.n[k].children[0]].kind {
                    Kind2::Text(t) => t.to_string(),
                    _ => unreachable!("a simple element holds text"),
                };
                let next_text = match &self.n[next].kind {
                    Kind2::Text(t) => t.to_string(),
                    _ => unreachable!("followed by text"),
                };
                let Kind2::Text(prev_text) = &self.n[prev].kind else {
                    unreachable!("preceded by text")
                };
                let merged = format!("{prev_text}<{name}>{inner}</{name}>{next_text}");
                self.n[prev].kind = Kind2::Text(Cow::Owned(merged));
                self.n[prev].span =
                    Span::new(self.n[prev].span.start_offset, self.n[next].span.end_offset);
                self.n[prev].sensitive.trailing = self.n[next].sensitive.trailing;
                self.n[prev].has.trailing = self.n[next].has.trailing;
                self.n[i].children.drain(j..=j + 1);
            }
        }
    }

    pub(super) fn is_simple_element(&self, k: usize, j: usize, children: &[usize]) -> bool {
        let n = &self.n[k];
        let Kind2::Element {
            attributes: Attributes::Template(attributes),
            ..
        } = n.kind
        else {
            return false;
        };
        let [child] = n.children[..] else {
            return false;
        };
        let Kind2::Text(t) = &self.n[child].kind else {
            return false;
        };
        attributes.is_empty()
            && !t.bytes().any(is_markup_ws)
            && !self.n[child].has.leading
            && !self.n[child].has.trailing
            && n.sensitive.leading
            && !n.has.leading
            && n.sensitive.trailing
            && !n.has.trailing
            && j > 0
            && j + 1 < children.len()
            && self.is_text(children[j - 1])
            && self.is_text(children[j + 1])
    }

    pub(super) fn line(&self, at: u32) -> u32 {
        self.lines.line_column(at).line
    }
}
