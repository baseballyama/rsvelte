use std::ops::Index;
use std::slice;

use super::Simple;

#[derive(Debug)]
pub struct SimpleList {
    first: Simple,
    rest: Box<[Simple]>,
}

impl SimpleList {
    pub(crate) const fn new(first: Simple, rest: Box<[Simple]>) -> Self {
        Self { first, rest }
    }

    #[must_use]
    pub const fn first(&self) -> &Simple {
        &self.first
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.rest.len() + 1
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        false
    }

    #[must_use]
    pub fn iter(&self) -> Iter<'_> {
        Iter {
            first: Some(&self.first),
            rest: self.rest.iter(),
        }
    }
}

impl Index<usize> for SimpleList {
    type Output = Simple;

    fn index(&self, index: usize) -> &Self::Output {
        if index == 0 {
            &self.first
        } else {
            &self.rest[index - 1]
        }
    }
}

impl<'a> IntoIterator for &'a SimpleList {
    type IntoIter = Iter<'a>;
    type Item = &'a Simple;

    fn into_iter(self) -> Self::IntoIter {
        self.iter()
    }
}

#[derive(Debug)]
pub struct Iter<'a> {
    first: Option<&'a Simple>,
    rest: slice::Iter<'a, Simple>,
}

impl<'a> Iterator for Iter<'a> {
    type Item = &'a Simple;

    fn next(&mut self) -> Option<Self::Item> {
        self.first.take().or_else(|| self.rest.next())
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        let len = self.rest.len() + usize::from(self.first.is_some());
        (len, Some(len))
    }
}

impl DoubleEndedIterator for Iter<'_> {
    fn next_back(&mut self) -> Option<Self::Item> {
        self.rest.next_back().or_else(|| self.first.take())
    }
}

impl ExactSizeIterator for Iter<'_> {}
impl std::iter::FusedIterator for Iter<'_> {}
