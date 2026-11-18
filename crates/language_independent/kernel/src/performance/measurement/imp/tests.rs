use super::{phase, snapshot};

#[test]
fn a_finished_threads_measurements_survive_until_snapshot() {
    const NAME: &str = "metrics.test.finished-thread";
    let before = snapshot()
        .into_iter()
        .find(|row| row.name == NAME)
        .map_or(0, |row| row.calls);
    std::thread::spawn(|| {
        let _phase = phase(NAME);
    })
    .join()
    .expect("measurement thread");
    let after = snapshot()
        .into_iter()
        .find(|row| row.name == NAME)
        .map_or(0, |row| row.calls);
    assert_eq!(after, before + 1);
    let repeated = snapshot()
        .into_iter()
        .find(|row| row.name == NAME)
        .map_or(0, |row| row.calls);
    assert_eq!(repeated, after);
}
