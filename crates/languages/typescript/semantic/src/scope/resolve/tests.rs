use super::{ScopeIdentifier, Span, TypedIndex, innermost_ranges};

/// The definition the sweep must agree with: the shortest containing range, the lowest scope on a
/// tie.
fn scan(ranges: &[(ScopeIdentifier, Span)], target: Span) -> Option<ScopeIdentifier> {
    ranges
        .iter()
        .filter(|(_, r)| r.start_offset <= target.start_offset && target.end_offset <= r.end_offset)
        .min_by_key(|&&(identifier, r)| (r.end_offset - r.start_offset, identifier))
        .map(|&(identifier, _)| identifier)
}

struct Random(u64);

impl Random {
    fn below(&mut self, n: u32) -> u32 {
        self.0 = self
            .0
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1);
        ((self.0 >> 33) % u64::from(n)) as u32
    }
}

/// Ranges that nest like a tree's, with duplicates and touching siblings.
fn nested(random: &mut Random, start: u32, end: u32, out: &mut Vec<Span>) {
    out.push(Span::new(start, end));
    if random.below(4) == 0 {
        out.push(Span::new(start, end));
    }
    let mut at = start;
    while end - at > 2 && random.below(3) != 0 {
        let child_start = at + random.below(2);
        let child_end = (child_start + 1 + random.below(end - child_start)).min(end);
        if child_end <= child_start || Span::new(child_start, child_end) == Span::new(start, end) {
            break;
        }
        nested(random, child_start, child_end, out);
        at = child_end;
    }
}

#[test]
fn the_sweep_finds_what_a_scan_of_every_range_finds() {
    let mut random = Random(7);
    for round in 0..300 {
        let mut spans = Vec::new();
        if round % 3 == 0 {
            // Ranges that cross, which only the scan handles.
            for _ in 0..random.below(20) {
                let start = random.below(60);
                spans.push(Span::new(start, start + random.below(30)));
            }
        } else {
            nested(&mut random, 0, 60, &mut spans);
        }
        let ranges: Vec<(ScopeIdentifier, Span)> = spans
            .into_iter()
            .enumerate()
            .map(|(i, span)| (ScopeIdentifier::new(i), span))
            .collect();
        let targets: Vec<Span> = (0..30)
            .map(|_| {
                let start = random.below(60);
                Span::new(start, start + 1 + random.below(3))
            })
            .collect();
        let expected: Vec<_> = targets.iter().map(|&t| scan(&ranges, t)).collect();
        let found = innermost_ranges(&mut ranges.clone(), targets.iter().copied());
        assert_eq!(found, expected, "round {round}: {ranges:?}");
    }
}
