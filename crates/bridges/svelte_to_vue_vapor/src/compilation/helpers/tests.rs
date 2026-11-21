use super::{Helper, requires};

/// The template adds what a helper requires one level deep, so what that requires must already
/// be listed.
#[test]
fn what_a_helper_requires_is_closed() {
    for &h in Helper::ALL {
        let direct = requires(h);
        for &r in direct {
            for indirect in requires(r) {
                assert!(
                    direct.contains(indirect),
                    "{h:?} needs {indirect:?} through {r:?}"
                );
            }
        }
    }
}
