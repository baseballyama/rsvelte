/// `f` over each item on every core, in the items' order.
pub(crate) fn map<T: Sync, R: Send>(items: &[T], f: impl Fn(&T) -> R + Sync) -> Vec<R> {
    let threads = std::thread::available_parallelism().map_or(1, std::num::NonZero::get);
    let f = &f;
    std::thread::scope(|scope| {
        // Spawn every worker before joining any, or they run one after another.
        let workers: Vec<_> = items
            .chunks(items.len().div_ceil(threads).max(1))
            .map(|chunk| scope.spawn(move || chunk.iter().map(f).collect::<Vec<_>>()))
            .collect();
        workers
            .into_iter()
            .flat_map(|w| w.join().unwrap_or_else(|p| std::panic::resume_unwind(p)))
            .collect()
    })
}
