use super::{plain, typescript};

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
    for path in [
        r"\\?\C:\a.\b",
        r"\\?\C:\a \b",
        r"\\?\C:\a\..\b",
        r"\\?\C:\a\NUL",
        r"\\?\C:\a\nul.txt",
        r"\\?\C:\a\COM1",
        r"\\?\C:\a\lpt9.log",
        r"\\?\C:\a\COM0",
        "\\\\?\\C:\\a\\COM\u{b9}",
        r"\\?\C:\a\NUL.tar.gz",
        "\\\\?\\C:\\a\\tab\tname",
        r"\\?\C:\a\b:c",
        r"\\?\C:\a\\b",
        r"\\?\Volume{1234}\a",
        r"\\?\UNC\server",
        r"\\?\UNC\\share",
    ] {
        assert_eq!(plain(path), path);
    }
}

#[test]
fn a_name_that_only_starts_like_a_device_reads_plain() {
    for (verbatim, plain_form) in [
        (
            r"\\?\C:\console\COM10\nullable",
            r"C:\console\COM10\nullable",
        ),
        (r"\\?\C:\src\Comp.svelte", r"C:\src\Comp.svelte"),
        (r"\\?\C:\work\coms\app", r"C:\work\coms\app"),
        (r"\\?\C:\a\lpta", r"C:\a\lpta"),
        (r"\\?\C:\a\LPTX", r"C:\a\LPTX"),
    ] {
        assert_eq!(plain(verbatim), plain_form);
    }
}

/// Length does not change which file a path names, and DEL and the C1 controls are characters
/// a name may hold.
#[test]
fn a_long_path_and_characters_beyond_ascii_read_plain() {
    let long = format!(
        "C:\\{}\\{}",
        "a".repeat(300),
        "\u{30e6}\u{30fc}\u{30b6}".repeat(40)
    );
    assert_eq!(plain(&format!("\\\\?\\{long}")), long);
    assert_eq!(
        plain("\\\\?\\C:\\a\u{7f}b\\\u{85}c"),
        "C:\\a\u{7f}b\\\u{85}c"
    );
}

#[test]
fn typescript_names_a_file_with_forward_slashes() {
    assert_eq!(typescript(r"C:\Users\a\b.ts"), "C:/Users/a/b.ts");
    assert_eq!(typescript(r"\\server\share\a.ts"), "//server/share/a.ts");
    assert_eq!(typescript("/home/a/b.ts"), "/home/a/b.ts");
}
