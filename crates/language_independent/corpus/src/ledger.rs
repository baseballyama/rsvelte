//! The parity ledger: the recorded verdict of every corpus unit, one file per task and variant,
//! `corpus/_registry/parity/<task>/<variant>.txt`. Only units that do not match are listed, as
//! `<family>/<source>/<path>\t<verdict>` in byte order, under a header that counts the matches;
//! the file shrinks as rsvelte catches up. Any verdict that moves fails the run until it is
//! recorded, so a fix is kept and a regression is seen.

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};

use crate::compare::Verdict;

/// One task and variant's recorded verdicts.
#[derive(Debug, Default, PartialEq, Eq)]
pub(crate) struct Table {
    pub(crate) matched: usize,
    pub(crate) listed: BTreeMap<String, Verdict>,
}

/// A unit whose verdict differs from the recorded one; `None` is "no output on either side".
#[derive(Debug, PartialEq, Eq)]
pub(crate) struct Move {
    pub(crate) unit: String,
    pub(crate) from: Option<Verdict>,
    pub(crate) to: Option<Verdict>,
}

pub(crate) fn file(registry: &Path, task: &str) -> PathBuf {
    let (task, variant) = rsvelte_kernel::task_files::location(task);
    registry
        .join("parity")
        .join(task)
        .join(format!("{variant}.txt"))
}

/// # Errors
///
/// The file exists but cannot be read, or a line is not `<unit>\t<verdict>`.
pub(crate) fn read(file: &Path) -> Result<Table, String> {
    let text = match std::fs::read_to_string(file) {
        Ok(text) => text,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Table::default()),
        Err(e) => return Err(format!("{}: {e}", file.display())),
    };
    let fail = |line: &str| format!("{}: line {line:?}", file.display());
    let mut lines = text.lines();
    let header = lines.next().unwrap_or_default();
    let matched = header
        .rsplit_once(": ")
        .and_then(|(_, n)| n.strip_suffix(" match"))
        .and_then(|n| n.parse().ok())
        .ok_or_else(|| fail(header))?;
    let mut listed = BTreeMap::new();
    for line in lines {
        let (unit, verdict) = line.split_once('\t').ok_or_else(|| fail(line))?;
        let verdict = Verdict::from_label(verdict).ok_or_else(|| fail(line))?;
        listed.insert(unit.to_owned(), verdict);
    }
    Ok(Table { matched, listed })
}

pub(crate) fn format(task: &str, table: &Table) -> String {
    let mut out = format!("# {task}: {} match\n", table.matched);
    for (unit, verdict) in &table.listed {
        writeln!(out, "{unit}\t{}", verdict.label()).expect("writing to a String succeeds");
    }
    out
}

/// The table of `now`, every unit's verdict.
pub(crate) fn table(now: &BTreeMap<String, Verdict>) -> Table {
    Table {
        matched: now.values().filter(|v| **v == Verdict::Match).count(),
        listed: now
            .iter()
            .filter(|(_, v)| **v != Verdict::Match)
            .map(|(k, v)| (k.clone(), *v))
            .collect(),
    }
}

/// Every unit among those `selected` whose verdict in `now` is not the recorded one. A unit not
/// listed was recorded as a match, or had no output; only the count tells them apart, and it is
/// compared when `whole` (nothing was filtered out).
pub(crate) fn moves(
    recorded: &Table,
    now: &BTreeMap<String, Verdict>,
    selected: impl Fn(&str) -> bool,
    whole: bool,
) -> (Vec<Move>, Option<(usize, usize)>) {
    let mut moved = Vec::new();
    for (unit, &to) in now.iter().filter(|(_, v)| **v != Verdict::Match) {
        let from = recorded.listed.get(unit).copied();
        if from != Some(to) {
            moved.push(Move {
                unit: unit.clone(),
                from: Some(from.unwrap_or(Verdict::Match)),
                to: Some(to),
            });
        }
    }
    for (unit, &from) in recorded.listed.iter().filter(|(u, _)| selected(u)) {
        match now.get(unit) {
            Some(Verdict::Match) => moved.push(Move {
                unit: unit.clone(),
                from: Some(from),
                to: Some(Verdict::Match),
            }),
            None => moved.push(Move {
                unit: unit.clone(),
                from: Some(from),
                to: None,
            }),
            Some(_) => {}
        }
    }
    moved.sort_unstable_by(|a, b| a.unit.cmp(&b.unit));
    let matched = now.values().filter(|v| **v == Verdict::Match).count();
    let count = (whole && matched != recorded.matched).then_some((recorded.matched, matched));
    (moved, count)
}

#[cfg(test)]
mod tests;
