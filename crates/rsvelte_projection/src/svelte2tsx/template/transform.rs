//! `transform` (`htmlxtojsx_v2/utils/node-utils.ts:26-135`).
//!
//! An opening tag is rewritten by *moving* the source ranges it keeps to the
//! end of the tag and appending the generated code after each of them, rather
//! than by overwriting the whole range with one baked string. The runs of
//! source between two kept ranges collapse to a single space that travels with
//! them, and that is where the generated attribute object's leading spaces come
//! from — the counts [`super::utils::opener_spacing`] otherwise has to model.

use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::template::segs::Seg;

/// One entry of upstream's `TransformationArray`.
pub(super) enum Tf {
    /// Generated code, appended after the range kept before it.
    Str(String),
    /// Source kept as-is.
    Range(u32, u32),
    /// The position after which removed runs are moved to the end before they
    /// are blanked, so deleted characters still map onto the generated object.
    Delete(u32),
}

/// A segment list is upstream's transformation array without the delete
/// marker; `LitOpen`'s in-place delimiter is what the extension guard does here.
pub(super) fn push_tf(transformations: &mut Vec<Tf>, seg: Seg) {
    match seg {
        Seg::Lit(text) | Seg::LitOpen(text) => transformations.push(Tf::Str(text)),
        Seg::Src(start, end) => transformations.push(Tf::Range(start, end)),
    }
}

/// Apply `transformations` over `[start, end)`.
pub(super) fn transform(str: &mut MagicString<'_>, start: u32, end: u32, transformations: &[Tf]) {
    let mut moves: Vec<(u32, u32)> = Vec::with_capacity(transformations.len());
    let mut append_position = end;
    let mut ignore_next_string = false;
    let mut delete_pos: Option<usize> = None;
    let mut delete_dest = 0u32;

    for (index, transformation) in transformations.iter().enumerate() {
        match transformation {
            Tf::Delete(dest) => {
                delete_pos = Some(moves.len());
                delete_dest = *dest;
            }
            Tf::Str(text) => {
                if !ignore_next_string {
                    str.append_left(append_position, text);
                }
                ignore_next_string = false;
            }
            Tf::Range(range_start, range_end) => {
                let (range_start, mut range_end) = (*range_start, *range_end);
                if range_start == range_end {
                    continue;
                }
                // A number in the array has no `[0]`, so only ranges can
                // suppress the extension.
                let starts_here = transformations
                    .iter()
                    .any(|other| matches!(other, Tf::Range(s, _) if *s == range_end));
                if range_end + 1 < end && !starts_here {
                    range_end += 1;
                    let next = transformations.get(index + 1);
                    ignore_next_string = matches!(next, Some(Tf::Str(_)));
                    let overwrite = match next {
                        Some(Tf::Str(text)) => text.as_str(),
                        _ => "",
                    };
                    str.overwrite_content_only(range_end - 1, range_end, overwrite);
                }
                append_position = range_end;
                moves.push((range_start, range_end));
            }
        }
    }

    let delete_pos = delete_pos.unwrap_or(moves.len());
    for &(move_start, move_end) in &moves[..delete_pos] {
        str.move_range(move_start, move_end, end);
    }

    let mut remove_start = start;
    let mut sorted = moves.clone();
    sorted.sort_by_key(|&(move_start, _)| move_start);
    for &(move_start, move_end) in &sorted {
        if remove_start < move_start {
            if delete_pos != moves.len()
                && remove_start > delete_dest
                && remove_start < end
                && move_start < end
            {
                str.move_range(remove_start, move_start, end);
            }
            if move_start < end {
                str.overwrite_content_only(remove_start, move_start, " ");
            }
        }
        remove_start = move_end;
    }

    if remove_start > end {
        // Rewind to the last kept range that starts before `end`; a range past
        // the opener (an implicit snippet prop reaches into the children) must
        // not decide what is deleted.
        remove_start = sorted
            .iter()
            .position(|&(move_start, _)| move_start > end)
            .filter(|index| *index > 0)
            .map_or(end, |index| sorted[index - 1].1);
    }
    if remove_start < end {
        str.overwrite_content_only(remove_start, remove_start + 1, "");
        remove_start += 1;
    }
    if remove_start < end {
        if delete_pos != moves.len() && remove_start > delete_dest && remove_start + 1 < end {
            str.move_range(remove_start, end - 1, end);
            str.overwrite_content_only(remove_start, end - 1, " ");
            str.overwrite_content_only(end - 1, end, "");
        } else {
            str.overwrite_content_only(remove_start, end, " ");
        }
    }

    for &(move_start, move_end) in &moves[delete_pos..] {
        if move_end >= end && move_start <= end {
            break;
        }
        str.move_range(move_start, move_end, end);
    }
}
