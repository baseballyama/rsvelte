use super::{Allowed, Problem, check_static};

#[test]
fn a_known_type_passes_unless_forbidden() {
    let all = Allowed::default();
    assert_eq!(check_static("submit", all), None);
    assert_eq!(check_static("", all), Some(Problem::Empty));
    assert_eq!(
        check_static("Submit", all),
        Some(Problem::Invalid("Submit"))
    );
    let no_reset = Allowed {
        reset: false,
        ..all
    };
    assert_eq!(
        check_static("reset", no_reset),
        Some(Problem::Forbidden("reset"))
    );
}
