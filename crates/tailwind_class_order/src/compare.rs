//! Port of Tailwind's `utils/compare.ts`: an alphanumeric comparison where
//! runs of ASCII digits are compared by numeric value rather than code point,
//! so `w-2` sorts before `w-10`.

use std::cmp::Ordering;

/// Compare two candidate strings the way Tailwind orders equally-ranked
/// utilities: character by character, but numeric runs compare numerically.
pub fn compare(a: &str, z: &str) -> Ordering {
    let a = a.as_bytes();
    let z = z.as_bytes();
    let (mut i, mut j) = (0usize, 0usize);

    while i < a.len() && j < z.len() {
        let ca = a[i];
        let cz = z[j];

        if ca.is_ascii_digit() && cz.is_ascii_digit() {
            let sa = i;
            while i < a.len() && a[i].is_ascii_digit() {
                i += 1;
            }
            let sz = j;
            while j < z.len() && z[j].is_ascii_digit() {
                j += 1;
            }
            let na = trim_leading_zeros(&a[sa..i]);
            let nz = trim_leading_zeros(&z[sz..j]);
            // Longer significant run => larger number; same length => byte order.
            let ord = na.len().cmp(&nz.len()).then_with(|| na.cmp(nz));
            if ord != Ordering::Equal {
                return ord;
            }
            // Numerically equal (e.g. `2` vs `02`): keep scanning.
        } else if ca != cz {
            return ca.cmp(&cz);
        } else {
            i += 1;
            j += 1;
        }
    }

    // Common prefix exhausted: the shorter string sorts first.
    (a.len() - i).cmp(&(z.len() - j))
}

fn trim_leading_zeros(digits: &[u8]) -> &[u8] {
    let mut k = 0;
    while k + 1 < digits.len() && digits[k] == b'0' {
        k += 1;
    }
    &digits[k..]
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering::*;

    #[test]
    fn numeric_runs_are_numeric() {
        assert_eq!(compare("w-2", "w-10"), Less);
        assert_eq!(compare("w-10", "w-2"), Greater);
        assert_eq!(compare("p-4", "p-4"), Equal);
    }

    #[test]
    fn prefix_sorts_first() {
        assert_eq!(compare("bg-red-500", "bg-red-500/50"), Less);
        assert_eq!(compare("!flex", "flex"), Less);
    }

    #[test]
    fn modifier_numeric() {
        assert_eq!(compare("bg-red-500/25", "bg-red-500/50"), Less);
    }
}
