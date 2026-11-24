use super::plain;

#[test]
fn a_verbatim_drive_path_reads_plain() {
    assert_eq!(
        plain(r"\\?\C:\Users\a\tsconfig.json"),
        r"C:\Users\a\tsconfig.json"
    );
    assert_eq!(plain(r"\\?\D:\"), r"D:\");
}

#[test]
fn a_verbatim_network_path_reads_as_a_network_path() {
    assert_eq!(plain(r"\\?\UNC\server\share"), r"\\server\share");
    assert_eq!(
        plain(r"\\?\UNC\server\share\a\b.ts"),
        r"\\server\share\a\b.ts"
    );
}

#[test]
fn a_plain_path_stays_as_it_is() {
    for path in [
        r"C:\a\b",
        r"\\server\share\a",
        "/home/a/b",
        "relative/a",
        "",
    ] {
        assert_eq!(plain(path), path);
    }
}

#[test]
fn a_path_the_plain_form_reads_otherwise_stays_verbatim() {
    let long = format!(r"\\?\C:\{}", "a".repeat(260));
    for path in [
        r"\\?\C:\a.\b",
        r"\\?\C:\a \b",
        r"\\?\C:\a\..\b",
        r"\\?\C:\a\NUL",
        r"\\?\C:\a\nul.txt",
        r"\\?\C:\a\COM1",
        r"\\?\C:\a\lpt9.log",
        r"\\?\C:\a\b:c",
        r"\\?\C:\a\\b",
        r"\\?\Volume{1234}\a",
        r"\\?\UNC\server",
        r"\\?\UNC\\share",
        &long,
    ] {
        assert_eq!(plain(path), path);
    }
}

#[test]
fn a_name_that_only_starts_like_a_device_reads_plain() {
    assert_eq!(
        plain(r"\\?\C:\console\COM10\nullable"),
        r"C:\console\COM10\nullable"
    );
}
