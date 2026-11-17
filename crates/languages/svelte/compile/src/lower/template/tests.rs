use super::scoped_class;
use crate::lower::Target;

#[test]
fn a_scoped_class_trims_its_start_on_the_server_only() {
    for (value, client, server) in [
        ("", "h", "h"),
        ("a", "a h", "a h"),
        (" a", " a h", "a h"),
        ("  ", "   h", "h"),
    ] {
        assert_eq!(
            scoped_class(value, "h", Target::Client),
            client,
            "{value:?}"
        );
        assert_eq!(
            scoped_class(value, "h", Target::Server),
            server,
            "{value:?}"
        );
    }
}
