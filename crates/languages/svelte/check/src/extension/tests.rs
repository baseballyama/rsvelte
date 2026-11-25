use super::*;

#[test]
fn the_mapper_is_found_among_the_programs_the_host_names() {
    let programs = std::env::temp_dir().join(format!("rsvelte-programs-{}", std::process::id()));
    std::fs::create_dir_all(&programs).expect("a scratch directory");
    let mapper = programs
        .join(MAPPER)
        .with_extension(std::env::consts::EXE_EXTENSION);
    assert_eq!(installed_mapper(Some(&programs)), None, "not installed yet");
    std::fs::write(&mapper, "").expect("write the mapper");
    assert_eq!(installed_mapper(Some(&programs)), Some(mapper));
    assert_eq!(installed_mapper(None), None, "a host without programs");
    std::fs::remove_dir_all(&programs).expect("remove the scratch directory");
}
