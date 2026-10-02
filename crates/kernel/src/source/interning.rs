//! Per-document string interning. All atom text lives in one buffer, so interning a new name costs
//! amortized growth of two vectors and a table slot — no allocation per atom.

use std::hash::Hasher;

use rustc_hash::FxHasher;

use crate::performance::buffer_pool;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, PartialOrd, Ord)]
pub struct Atom(pub u32);

#[derive(Debug)]
pub struct Interner {
    buffer: String,
    ends: Vec<u32>,
    /// Open addressing over atom identifiers + 1 (0 = empty); capacity is a power of two.
    table: Vec<u32>,
}

fn hash(s: &str) -> u64 {
    let mut h = FxHasher::default();
    h.write(s.as_bytes());
    h.finish()
}

/// The buffers come from the thread's [`buffer_pool`], under this type's key, and go back to it in
/// the reverse order (`ends` and `table` share a type).
impl Default for Interner {
    fn default() -> Self {
        Self {
            buffer: buffer_pool::take_string::<Self>(),
            ends: buffer_pool::take_keyed::<Self, u32>(),
            table: buffer_pool::take_keyed::<Self, u32>(),
        }
    }
}

impl Drop for Interner {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.table));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.ends));
        buffer_pool::give_string::<Self>(std::mem::take(&mut self.buffer));
    }
}

impl Interner {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn clear(&mut self) {
        self.buffer.clear();
        self.ends.clear();
        self.table.iter_mut().for_each(|s| *s = 0);
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.ends.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.ends.is_empty()
    }

    #[must_use]
    pub fn get(&self, atom: Atom) -> &str {
        let end = self.ends[atom.0 as usize] as usize;
        let start = if atom.0 == 0 {
            0
        } else {
            self.ends[atom.0 as usize - 1] as usize
        };
        &self.buffer[start..end]
    }

    #[must_use]
    pub fn lookup(&self, s: &str) -> Option<Atom> {
        if self.table.is_empty() {
            return None;
        }
        self.probe(hash(s), s).ok()
    }

    /// The atom for `s`, or the empty slot where it would go. The table must not be empty.
    fn probe(&self, h: u64, s: &str) -> Result<Atom, usize> {
        let mask = self.table.len() - 1;
        let mut i = h as usize & mask;
        loop {
            match self.table[i] {
                0 => return Err(i),
                identifier if self.get(Atom(identifier - 1)) == s => {
                    return Ok(Atom(identifier - 1));
                }
                _ => i = (i + 1) & mask,
            }
        }
    }

    pub fn intern(&mut self, s: &str) -> Atom {
        if self.table.is_empty() {
            self.grow();
        }
        let h = hash(s);
        let empty = match self.probe(h, s) {
            Ok(atom) => return atom,
            Err(empty) => empty,
        };
        // Only a new atom raises the load factor, so a hit never grows the table.
        let i = if (self.ends.len() + 1) * 2 > self.table.len() {
            self.grow();
            self.probe(h, s).expect_err("absent before growing")
        } else {
            empty
        };
        self.buffer.push_str(s);
        self.ends.push(self.buffer.len() as u32);
        let atom = Atom(self.ends.len() as u32 - 1);
        self.table[i] = atom.0 + 1;
        atom
    }

    fn grow(&mut self) {
        let cap = (self.table.len() * 2).max(64);
        self.table.clear();
        self.table.resize(cap, 0);
        let mask = cap - 1;
        for identifier in 0..self.ends.len() as u32 {
            let mut i = hash(self.get(Atom(identifier))) as usize & mask;
            while self.table[i] != 0 {
                i = (i + 1) & mask;
            }
            self.table[i] = identifier + 1;
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

    #[test]
    fn a_hit_does_not_grow_the_table() {
        let mut i = Interner::new();
        for n in 0..32 {
            i.intern(&format!("n{n}"));
        }
        let cap = i.table.len();
        assert!((i.len() + 1) * 2 > cap, "the next new name would grow it");
        i.intern("n0");
        assert_eq!(i.table.len(), cap);
        i.intern("new");
        assert!(i.table.len() > cap);
        assert_eq!(i.lookup("new"), Some(Atom(32)));
    }
}
