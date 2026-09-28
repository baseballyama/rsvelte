//! Per-document string interning. All atom text lives in one buffer, so interning a new name costs
//! amortized growth of two vectors and a table slot — no allocation per atom.

use rustc_hash::FxHasher;
use std::hash::Hasher;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, PartialOrd, Ord)]
pub struct Atom(pub u32);

#[derive(Default)]
pub struct Interner {
    buf: String,
    ends: Vec<u32>,
    /// Open addressing over atom ids + 1 (0 = empty); capacity is a power of two.
    table: Vec<u32>,
}

fn hash(s: &str) -> u64 {
    let mut h = FxHasher::default();
    h.write(s.as_bytes());
    h.finish()
}

impl Interner {
    pub fn new() -> Interner {
        Interner::default()
    }

    pub fn clear(&mut self) {
        self.buf.clear();
        self.ends.clear();
        self.table.iter_mut().for_each(|s| *s = 0);
    }

    pub fn len(&self) -> usize {
        self.ends.len()
    }

    pub fn is_empty(&self) -> bool {
        self.ends.is_empty()
    }

    pub fn get(&self, atom: Atom) -> &str {
        let end = self.ends[atom.0 as usize] as usize;
        let start = if atom.0 == 0 {
            0
        } else {
            self.ends[atom.0 as usize - 1] as usize
        };
        &self.buf[start..end]
    }

    pub fn lookup(&self, s: &str) -> Option<Atom> {
        if self.table.is_empty() {
            return None;
        }
        let mask = self.table.len() - 1;
        let mut i = hash(s) as usize & mask;
        loop {
            match self.table[i] {
                0 => return None,
                id if self.get(Atom(id - 1)) == s => return Some(Atom(id - 1)),
                _ => i = (i + 1) & mask,
            }
        }
    }

    pub fn intern(&mut self, s: &str) -> Atom {
        if (self.ends.len() + 1) * 2 > self.table.len() {
            self.grow();
        }
        let mask = self.table.len() - 1;
        let mut i = hash(s) as usize & mask;
        loop {
            match self.table[i] {
                0 => break,
                id if self.get(Atom(id - 1)) == s => return Atom(id - 1),
                _ => i = (i + 1) & mask,
            }
        }
        self.buf.push_str(s);
        self.ends.push(self.buf.len() as u32);
        let atom = Atom(self.ends.len() as u32 - 1);
        self.table[i] = atom.0 + 1;
        atom
    }

    fn grow(&mut self) {
        let cap = (self.table.len() * 2).max(64);
        self.table = vec![0; cap];
        let mask = cap - 1;
        for id in 0..self.ends.len() as u32 {
            let mut i = hash(self.get(Atom(id))) as usize & mask;
            while self.table[i] != 0 {
                i = (i + 1) & mask;
            }
            self.table[i] = id + 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn interning_is_idempotent_and_survives_growth() {
        let mut i = Interner::new();
        let names: Vec<String> = (0..500).map(|n| format!("n{n}")).collect();
        let atoms: Vec<Atom> = names.iter().map(|n| i.intern(n)).collect();
        for (n, a) in names.iter().zip(&atoms) {
            assert_eq!(i.intern(n), *a);
            assert_eq!(i.get(*a), n);
            assert_eq!(i.lookup(n), Some(*a));
        }
        assert_eq!(i.lookup("missing"), None);
    }
}
