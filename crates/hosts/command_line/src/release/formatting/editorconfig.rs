//! `.editorconfig`, read as Prettier reads it (the `editorconfig` package and
//! `editorconfig-to-prettier`): the sections that match a file, from the outermost file to the
//! nearest, become the options its properties map to.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use globset::{GlobBuilder, GlobMatcher};
use serde_json::Value;

/// One `.editorconfig`.
#[derive(Debug)]
pub(crate) struct EditorConfig {
    pub(crate) source: Arc<Path>,
    /// Its preamble's `root`: no file above it counts.
    pub(crate) root: bool,
    sections: Vec<Section>,
}

#[derive(Debug)]
struct Section {
    /// `None` for a glob that matches nothing.
    matcher: Option<GlobMatcher>,
    properties: Vec<(String, Value)>,
}

/// A property's value, and the `.editorconfig` that set it.
type Property = (Value, Written);

/// Where a property was written: its `.editorconfig` and its key there.
#[derive(Clone, Debug)]
pub(crate) struct Written {
    pub(crate) file: Arc<Path>,
    pub(crate) key: &'static str,
}

/// What `.editorconfig` gives an option of Prettier's.
#[derive(Debug, PartialEq, Eq)]
pub(crate) enum Given {
    Value(Value),
    /// `max_line_length = off`, which Prettier reads as an unlimited `printWidth`.
    Unlimited,
}

/// How a formatter maps `.editorconfig` properties to its options.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Reading {
    /// Whether `indent_size = tab` alone means tabs, as `editorconfig-to-prettier` reads it.
    tab_size_is_tabs: bool,
    /// The least width it takes from a property: Prettier skips 0, oxfmt loads it.
    least_width: u64,
    /// Whether `max_line_length = off` means no line limit, as Prettier reads it; oxfmt drops it.
    off_is_unlimited: bool,
}

pub(crate) const PRETTIER: Reading = Reading {
    tab_size_is_tabs: true,
    least_width: 1,
    off_is_unlimited: true,
};

pub(crate) const OXFMT: Reading = Reading {
    tab_size_is_tabs: false,
    least_width: 0,
    off_is_unlimited: false,
};

/// An option under Prettier's name, what it is given, and the `.editorconfig` that gave it.
pub(crate) type Setting = (&'static str, Given, Written);

impl EditorConfig {
    /// A file that cannot be read is no `.editorconfig`, as the package reads it.
    pub(crate) fn read(source: PathBuf) -> Option<Self> {
        let text = std::fs::read_to_string(&source).ok()?;
        Some(Self::parse(source.into(), &text))
    }

    /// A file the INI parser rejects, as the package rejects it, has no sections and no `root`.
    fn parse(source: Arc<Path>, text: &str) -> Self {
        let mut preamble = Vec::new();
        let mut sections: Vec<(String, Vec<(String, Value)>)> = Vec::new();
        let mut current: Option<usize> = None;
        for line in text.lines().map(str::trim) {
            if line.is_empty() || line.starts_with(['#', ';']) {
                continue;
            }
            if let Some(header) = line.strip_prefix('[') {
                let Some(name) = header.strip_suffix(']') else {
                    return Self::empty(source);
                };
                // A section named twice is one section, where it first appeared.
                let index = sections.iter().position(|(n, _)| n == name);
                current = Some(index.unwrap_or_else(|| {
                    sections.push((name.to_owned(), Vec::new()));
                    sections.len() - 1
                }));
                continue;
            }
            let Some((key, value)) = line.split_once('=') else {
                return Self::empty(source);
            };
            let pairs = current.map_or(&mut preamble, |index| &mut sections[index].1);
            set(
                pairs,
                key.trim().to_lowercase(),
                property(key.trim(), value.trim()),
            );
        }
        let root = preamble
            .iter()
            .find(|(key, _)| key == "root")
            .is_some_and(|(_, value)| truthy(value));
        let sections = (sections.into_iter())
            .map(|(name, properties)| Section {
                matcher: matcher(&name),
                properties,
            })
            .collect();
        Self {
            source,
            root,
            sections,
        }
    }

    const fn empty(source: Arc<Path>) -> Self {
        Self {
            source,
            root: false,
            sections: Vec::new(),
        }
    }
}

fn set(pairs: &mut Vec<(String, Value)>, key: String, value: Value) {
    match pairs.iter_mut().find(|(k, _)| *k == key) {
        Some((_, old)) => *old = value,
        None => pairs.push((key, value)),
    }
}

/// The value as the package reads it: lower case for the properties of the specification, then
/// JSON when it parses as JSON.
fn property(key: &str, value: &str) -> Value {
    const KNOWN: &[&str] = &[
        "charset",
        "end_of_line",
        "indent_size",
        "indent_style",
        "insert_final_newline",
        "trim_trailing_whitespace",
    ];
    let value = if KNOWN.contains(&key.to_lowercase().as_str()) {
        value.to_lowercase()
    } else {
        value.to_owned()
    };
    match serde_json::from_str(&value) {
        Ok(Value::Null) | Err(_) => Value::String(value),
        Ok(parsed) => parsed,
    }
}

fn truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().is_some_and(|n| n != 0.0),
        Value::String(s) => !s.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

/// The section's glob, for paths relative to the directory of its `.editorconfig`: one without a
/// `/` matches in any directory below it, and a `**` inside a name matches across directories,
/// as `{*,**/**/**}` does where the package rewrites it.
fn matcher(name: &str) -> Option<GlobMatcher> {
    let relative = match name.find('/') {
        None => format!("**/{name}"),
        Some(0) => name[1..].to_owned(),
        Some(_) => name.to_owned(),
    };
    let segments: Vec<String> = (relative.split('/'))
        .map(|segment| match segment {
            "**" => segment.to_owned(),
            _ if segment.contains("**") => format!("**/{}", segment.replace("**", "*")),
            _ => segment.to_owned(),
        })
        .collect();
    let glob = GlobBuilder::new(&segments.join("/"))
        .literal_separator(true)
        .build()
        .ok()?;
    Some(glob.compile_matcher())
}

/// The options that `files`, outermost first, give `file`, each with the file that set it.
pub(crate) fn options<'a>(
    reading: Reading,
    files: impl IntoIterator<Item = &'a EditorConfig>,
    file: &Path,
) -> Vec<Setting> {
    let mut properties: Vec<(String, (Value, Arc<Path>))> = Vec::new();
    for config in files {
        let directory = config.source.parent().unwrap_or_else(|| Path::new(""));
        let Ok(relative) = file.strip_prefix(directory) else {
            continue;
        };
        for section in &config.sections {
            if section
                .matcher
                .as_ref()
                .is_some_and(|m| m.is_match(relative))
            {
                for (key, value) in &section.properties {
                    let property = (value.clone(), Arc::clone(&config.source));
                    match properties.iter_mut().find(|(k, _)| k == key) {
                        Some((_, old)) => *old = property,
                        None => properties.push((key.clone(), property)),
                    }
                }
            }
        }
    }
    let get = |key: &'static str| {
        let (_, (value, file)) = properties.iter().find(|(k, _)| k == key)?;
        let file = Arc::clone(file);
        Some((value.clone(), Written { file, key }))
    };
    prettier(
        reading,
        processed(get("indent_style"), get("indent_size"), get("tab_width")),
        get,
    )
}

/// `indent_size` and `tab_width` completed from each other, as the package completes them.
fn processed(
    indent_style: Option<Property>,
    mut indent_size: Option<Property>,
    mut tab_width: Option<Property>,
) -> [Option<Property>; 3] {
    let tab = Value::from("tab");
    if indent_style.as_ref().is_some_and(|(v, _)| *v == tab) && indent_size.is_none() {
        indent_size = indent_style
            .as_ref()
            .map(|(_, written)| (tab.clone(), written.clone()));
    }
    if let Some(size) = indent_size.as_ref().filter(|(v, _)| *v != tab)
        && tab_width.is_none()
    {
        tab_width = Some(size.clone());
    }
    if indent_size.as_ref().is_some_and(|(v, _)| *v == tab)
        && let Some(width) = &tab_width
    {
        indent_size = Some(width.clone());
    }
    [indent_style, indent_size, tab_width]
}

/// `editorconfig-to-prettier`, as `reading` differs from it.
fn prettier(
    reading: Reading,
    [indent_style, indent_size, tab_width]: [Option<Property>; 3],
    get: impl Fn(&'static str) -> Option<Property>,
) -> Vec<Setting> {
    let is = |property: &Option<Property>, value: &str| {
        property.as_ref().is_some_and(|(v, _)| v == value)
    };
    let width = |property: &Option<Property>| {
        property.as_ref().and_then(|(v, at)| {
            let width = v.as_u64().filter(|&n| n >= reading.least_width)?;
            Some((width, at.clone()))
        })
    };
    let mut options = Vec::new();
    let use_tabs = if is(&indent_style, "space") {
        indent_style.as_ref().map(|(_, at)| (false, at))
    } else if is(&indent_style, "tab") {
        indent_style.as_ref().map(|(_, at)| (true, at))
    } else if reading.tab_size_is_tabs && is(&indent_size, "tab") {
        indent_size.as_ref().map(|(_, at)| (true, at))
    } else {
        None
    };
    if let Some((use_tabs, at)) = use_tabs {
        options.push(("useTabs", Given::Value(Value::from(use_tabs)), at.clone()));
    }
    let tab_width = match (use_tabs, width(&indent_size)) {
        (Some((false, _)), Some(size)) => Some(size),
        _ => width(&tab_width),
    };
    if let Some((width, at)) = tab_width {
        options.push(("tabWidth", Given::Value(Value::from(width)), at));
    }
    let max_line_length = get("max_line_length");
    if let Some((_, at)) = max_line_length.as_ref().filter(|(v, _)| v == "off") {
        if reading.off_is_unlimited {
            options.push(("printWidth", Given::Unlimited, at.clone()));
        }
    } else if let Some((width, at)) = width(&max_line_length) {
        options.push(("printWidth", Given::Value(Value::from(width)), at));
    }
    if let Some((quote, at)) = get("quote_type") {
        match quote.as_str() {
            Some("single") => options.push(("singleQuote", Given::Value(Value::from(true)), at)),
            Some("double") => options.push(("singleQuote", Given::Value(Value::from(false)), at)),
            _ => {}
        }
    }
    if let Some((end, at)) = get("end_of_line")
        && matches!(end.as_str(), Some("lf" | "crlf" | "cr"))
    {
        options.push(("endOfLine", Given::Value(end), at));
    }
    options
}
