use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

/// `f` over each item on every core, in the items' order. Each thread takes the next item when it
/// is free, so a few large items do not leave the other threads idle.
pub(crate) fn map<T: Sync, R: Send>(items: &[T], f: impl Fn(&T) -> R + Sync) -> Vec<R> {
    let threads = std::thread::available_parallelism()
        .map_or(1, std::num::NonZero::get)
        .min(items.len());
    let next = AtomicUsize::new(0);
    let done = Mutex::new(Vec::with_capacity(items.len()));
    std::thread::scope(|scope| {
        for _ in 0..threads {
            scope.spawn(|| {
                let mut mine = Vec::new();
                loop {
                    let i = next.fetch_add(1, Ordering::Relaxed);
                    let Some(item) = items.get(i) else { break };
                    mine.push((i, f(item)));
                }
                done.lock()
                    .unwrap_or_else(std::sync::PoisonError::into_inner)
                    .extend(mine);
            });
        }
    });
    let mut done = done
        .into_inner()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    done.sort_unstable_by_key(|(i, _)| *i);
    done.into_iter().map(|(_, r)| r).collect()
}

#[cfg(test)]
mod tests;
