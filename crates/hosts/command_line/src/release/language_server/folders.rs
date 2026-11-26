//! The workspace folders an editor names when it starts a server.

use std::path::{Path, PathBuf};

use oxc_language_server::uri_utils::uri_to_file_path;
use tower_lsp_server::gen_lsp_types::{Uri, WorkspaceFolders};

/// A workspace folder, by the path the editor names it and by its real path.
#[derive(Clone, Debug)]
pub(super) struct Folder {
    pub(super) given: PathBuf,
    pub(super) real: PathBuf,
}

/// The folders of `listed`, and `root`, which a client without workspace folders sends alone,
/// each once and each a directory on the disk.
pub(super) fn folders(root: Option<&Uri>, listed: Option<&WorkspaceFolders>) -> Vec<Folder> {
    let listed = match listed {
        Some(WorkspaceFolders::WorkspaceFolderList(folders)) => folders.as_slice(),
        _ => &[],
    };
    let mut folders = (listed.iter())
        .map(|folder| &folder.uri)
        .chain(root)
        .filter_map(|uri| {
            let given = uri_to_file_path(uri)?.into_owned();
            let real = real(&given)?;
            Some(Folder { given, real })
        })
        .collect::<Vec<_>>();
    folders.sort_by(|a, b| a.real.cmp(&b.real));
    folders.dedup_by(|a, b| a.real == b.real);
    folders
}

pub(super) fn real(path: &Path) -> Option<PathBuf> {
    rsvelte_kernel::source::paths::canonicalize(path).ok()
}
