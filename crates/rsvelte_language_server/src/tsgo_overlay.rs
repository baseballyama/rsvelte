//! Diskless Svelte projections for the tsgo LSP child process.
//!
//! tsgo only considers an in-memory file during module resolution when its
//! parent directory exists. This module therefore persists the minimum viable
//! project — a tsconfig, the svelte2tsx shims, and empty parent directories —
//! while every generated `.svelte.tsx` body stays in memory.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use std::fs;
use std::io;
use std::path::{Component, Path, PathBuf};
use std::str::FromStr;

use lsp_types::{Position, Range, Uri};
use rsvelte_projection::{
    ProjectionEngine, ProjectionMap, RewriteExternalImportsOptions, Svelte2TsxMode,
    Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion,
};
use serde_json::json;
use sourcemap::SourceMap;

use crate::text::LineIndex;

const CACHE_DIRECTORY: &str = ".rsvelte-language-server";
const TSGO_DIRECTORY: &str = "tsgo";
const SHADOW_DIRECTORY: &str = "svelte";
const OVERLAY_TSCONFIG: &str = "tsconfig.json";
const SHIM_SHIMS_NAME: &str = "svelte-shims-v4.d.ts";
const SHIM_JSX_NAME: &str = "svelte-jsx-v4.d.ts";
const SHIM_SHIMS: &str =
    include_str!("../../rsvelte_check/src/svelte_check/shims/svelte-shims-v4.d.ts");
const SHIM_JSX: &str =
    include_str!("../../rsvelte_check/src/svelte_check/shims/svelte-jsx-v4.d.ts");
const IGNORE_START: &str = "/*Ωignore_startΩ*/";
const IGNORE_END: &str = "/*Ωignore_endΩ*/";

/// One virtual document to open or update in the tsgo child.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ShadowDocument {
    /// URI of the user's `.svelte` document.
    pub source_uri: Uri,
    /// URI of `<cache>/svelte/<relative>.svelte.tsx`.
    pub shadow_uri: Uri,
    /// LSP language id sent to tsgo.
    pub language_id: String,
    /// Generated svelte2tsx body. This text is never persisted by the overlay.
    pub text: String,
    /// Document version sent to tsgo.
    pub version: i32,
}

/// Observable invariants that prevent an unresolved component from silently
/// falling through to ambient `declare module '*.svelte'` and becoming `any`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ShadowResolutionInfo {
    /// Source component routed by this entry.
    pub source_path: PathBuf,
    /// Virtual TSX path tsgo must have open.
    pub shadow_path: PathBuf,
    /// Whether the source is confined to the workspace.
    pub source_in_workspace: bool,
    /// Whether the shadow is confined to the cache's `svelte` root.
    pub shadow_in_cache: bool,
    /// Whether tsgo's required on-disk parent directory exists.
    pub parent_directory_exists: bool,
    /// Whether an in-memory shadow body is registered for this route.
    pub shadow_registered: bool,
    /// Whether the overlay tsconfig's include pattern admits the shadow.
    pub included_by_overlay_config: bool,
    /// Whether the shadow body was accidentally written to disk.
    pub body_exists_on_disk: bool,
}

impl ShadowResolutionInfo {
    /// Whether the route has every invariant needed to avoid ambient-any
    /// fallback while retaining diskless overlay semantics.
    #[must_use]
    pub const fn is_resolvable(&self) -> bool {
        self.source_in_workspace
            && self.shadow_in_cache
            && self.parent_directory_exists
            && self.shadow_registered
            && self.included_by_overlay_config
            && !self.body_exists_on_disk
    }
}

/// Changes found while reconciling the eager project set with disk.
#[derive(Debug, Default, Clone)]
pub struct OverlayUpdate {
    /// New or changed shadow buffers to send with `didOpen` / `didChange`.
    pub opened_or_changed: Vec<ShadowDocument>,
    /// Shadow URIs removed because their sources no longer exist.
    pub closed: Vec<Uri>,
}

/// Failure to prepare or update an overlay.
#[derive(Debug)]
pub enum TsgoOverlayError {
    /// Filesystem operation failed.
    Io(io::Error),
    /// A source path does not name a confined `.svelte` file.
    InvalidSource { path: PathBuf, reason: &'static str },
    /// svelte2tsx rejected a source document.
    Projection { path: PathBuf, message: String },
    /// A filesystem path could not be represented as a file URI.
    InvalidUri(PathBuf),
    /// The generated source map was malformed.
    InvalidSourceMap { path: PathBuf, message: String },
}

impl fmt::Display for TsgoOverlayError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(f, "overlay I/O error: {error}"),
            Self::InvalidSource { path, reason } => {
                write!(f, "invalid Svelte source {}: {reason}", path.display())
            }
            Self::Projection { path, message } => {
                write!(f, "svelte2tsx failed on {}: {message}", path.display())
            }
            Self::InvalidUri(path) => write!(f, "cannot encode {} as a file URI", path.display()),
            Self::InvalidSourceMap { path, message } => {
                write!(f, "invalid source map for {}: {message}", path.display())
            }
        }
    }
}

impl std::error::Error for TsgoOverlayError {}

impl From<io::Error> for TsgoOverlayError {
    fn from(value: io::Error) -> Self {
        Self::Io(value)
    }
}

#[derive(Debug, Clone, Copy)]
struct MappingToken {
    generated_line: u32,
    generated_column: u32,
    source: Option<(u32, u32)>,
}

struct ShadowState {
    document: ShadowDocument,
    source_path: PathBuf,
    shadow_path: PathBuf,
    source_text: String,
    source_index: LineIndex,
    generated_index: LineIndex,
    exact_map: ProjectionMap,
    source_map: Option<String>,
    tokens: Vec<MappingToken>,
    generated_ranges: Vec<std::ops::Range<usize>>,
    identity: bool,
    plain_insertions: Vec<(usize, std::ops::Range<usize>)>,
}

/// Workspace-scoped diskless overlay used by the tsgo LSP proxy.
pub struct TsgoOverlay {
    workspace: PathBuf,
    cache_dir: PathBuf,
    shadow_dir: PathBuf,
    tsconfig_path: PathBuf,
    source_tsconfig: Option<PathBuf>,
    engine: ProjectionEngine,
    accessors: bool,
    namespace: Svelte2TsxNamespace,
    entries: BTreeMap<PathBuf, ShadowState>,
    by_shadow: BTreeMap<PathBuf, PathBuf>,
}

impl fmt::Debug for TsgoOverlay {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("TsgoOverlay")
            .field("workspace", &self.workspace)
            .field("cache_dir", &self.cache_dir)
            .field("tsconfig_path", &self.tsconfig_path)
            .field("entries", &self.entries.len())
            .finish_non_exhaustive()
    }
}

impl TsgoOverlay {
    /// Build the workspace overlay and project every `.svelte` source eagerly.
    ///
    /// `tsconfig` defaults to `tsconfig.json`, then `jsconfig.json`, when one
    /// exists at the workspace root.
    pub fn build(workspace: &Path, tsconfig: Option<&Path>) -> Result<Self, TsgoOverlayError> {
        let workspace = absolute_normalized(workspace);
        let workspace = fs::canonicalize(&workspace)?;
        if !workspace.is_dir() {
            return Err(TsgoOverlayError::InvalidSource {
                path: workspace,
                reason: "workspace is not a directory",
            });
        }

        let cache_dir = workspace.join(CACHE_DIRECTORY).join(TSGO_DIRECTORY);
        let shadow_dir = cache_dir.join(SHADOW_DIRECTORY);
        reject_symlink_components(&cache_dir, &workspace)?;
        fs::create_dir_all(&shadow_dir)?;
        reject_symlink_components(&shadow_dir, &cache_dir)?;

        let source_tsconfig = resolve_tsconfig(&workspace, tsconfig);
        let tsconfig_path = cache_dir.join(OVERLAY_TSCONFIG);
        let compiler = rsvelte_check::config::load_compiler_options(&workspace);
        let mut overlay = Self {
            workspace,
            cache_dir,
            shadow_dir,
            tsconfig_path,
            source_tsconfig,
            engine: ProjectionEngine::new(),
            accessors: compiler.projection_accessors(),
            namespace: compiler.projection_namespace(),
            entries: BTreeMap::new(),
            by_shadow: BTreeMap::new(),
        };
        overlay.materialize_support_files()?;

        for path in rsvelte_check::find_svelte_files(&overlay.workspace, &[]) {
            let text = fs::read_to_string(&path)?;
            overlay.open_or_update(&path, &text, 0)?;
        }
        overlay.write_tsconfig()?;
        Ok(overlay)
    }

    /// Absolute workspace root.
    #[must_use]
    pub fn workspace(&self) -> &Path {
        &self.workspace
    }

    /// Directory containing the persisted config, shims, and skeleton.
    #[must_use]
    pub fn cache_dir(&self) -> &Path {
        &self.cache_dir
    }

    /// Overlay tsconfig to pass to tsgo.
    #[must_use]
    pub fn tsconfig_path(&self) -> &Path {
        &self.tsconfig_path
    }

    /// Generate or replace one virtual shadow buffer.
    pub fn open_or_update(
        &mut self,
        source_path: &Path,
        text: &str,
        version: i32,
    ) -> Result<ShadowDocument, TsgoOverlayError> {
        let source_path = self.confined_source(source_path)?;
        let shadow_path = self.shadow_path_for(&source_path)?;
        self.ensure_shadow_parent(&shadow_path)?;

        let options = self.projection_options(&source_path, &shadow_path, text);
        let artifact =
            self.engine
                .project(text, options)
                .map_err(|error| TsgoOverlayError::Projection {
                    path: source_path.clone(),
                    message: error.to_string(),
                })?;
        let mut exact_map = artifact.exact_mappings.unwrap_or_default();
        let source_map = artifact.source_map;
        let mut tokens = parse_mapping_tokens(&source_path, source_map.as_deref())?;
        let original_generated = artifact.code;
        let original_index = LineIndex::new(&original_generated);
        let (generated_text, import_insertions) = rewrite_plain_svelte_imports(&original_generated);
        let insertion_positions = import_insertions
            .iter()
            .map(|(original_offset, generated_range)| {
                (
                    original_index.position(&original_generated, *original_offset),
                    generated_range.len() as u32,
                )
            })
            .collect::<Vec<_>>();
        for token in &mut tokens {
            token.generated_column += insertion_positions
                .iter()
                .filter(|(position, _)| {
                    token.generated_line == position.line
                        && token.generated_column >= position.character
                })
                .map(|(_, length)| *length)
                .sum::<u32>();
        }
        for (_, generated_range) in &import_insertions {
            exact_map.insert_generated(generated_range.start as u32, generated_range.len() as u32);
        }
        let document = ShadowDocument {
            source_uri: path_to_uri(&source_path)?,
            shadow_uri: path_to_uri(&shadow_path)?,
            language_id: "typescriptreact".to_string(),
            text: generated_text,
            version,
        };
        let mut generated_ranges = ignored_ranges(&document.text);
        generated_ranges.extend(
            import_insertions
                .iter()
                .map(|(_, generated)| generated.clone()),
        );
        let state = ShadowState {
            source_path: source_path.clone(),
            shadow_path: shadow_path.clone(),
            source_text: text.to_string(),
            source_index: LineIndex::new(text),
            generated_index: LineIndex::new(&document.text),
            exact_map,
            source_map,
            tokens,
            generated_ranges,
            identity: false,
            plain_insertions: Vec::new(),
            document: document.clone(),
        };
        if let Some(old) = self.entries.insert(source_path.clone(), state) {
            self.by_shadow.remove(&old.shadow_path);
        }
        self.by_shadow.insert(shadow_path, source_path);
        Ok(document)
    }

    /// Route an open TypeScript or JavaScript buffer through the overlay
    /// project without persisting its body.
    pub fn open_plain(
        &mut self,
        source_path: &Path,
        text: &str,
        version: i32,
        language_id: &str,
    ) -> Result<ShadowDocument, TsgoOverlayError> {
        let source_path = self.confined_any_source(source_path)?;
        let relative = source_path.strip_prefix(&self.workspace).map_err(|_| {
            TsgoOverlayError::InvalidSource {
                path: source_path.clone(),
                reason: "source escapes the workspace",
            }
        })?;
        let shadow_path = self.shadow_dir.join(relative);
        self.ensure_shadow_parent(&shadow_path)?;
        let (generated_text, plain_insertions) = rewrite_plain_svelte_imports(text);
        let document = ShadowDocument {
            source_uri: path_to_uri(&source_path)?,
            shadow_uri: path_to_uri(&shadow_path)?,
            language_id: language_id.to_string(),
            text: generated_text,
            version,
        };
        let state = ShadowState {
            source_path: source_path.clone(),
            shadow_path: shadow_path.clone(),
            source_text: text.to_string(),
            source_index: LineIndex::new(text),
            generated_index: LineIndex::new(text),
            exact_map: ProjectionMap::default(),
            tokens: Vec::new(),
            source_map: None,
            generated_ranges: Vec::new(),
            identity: true,
            plain_insertions,
            document: document.clone(),
        };
        if let Some(old) = self.entries.insert(source_path.clone(), state) {
            self.by_shadow.remove(&old.shadow_path);
        }
        self.by_shadow.insert(shadow_path, source_path);
        Ok(document)
    }

    /// Remove a routed plain buffer and its empty directory skeleton.
    pub fn close_plain(&mut self, source_path: &Path) -> Result<Option<Uri>, TsgoOverlayError> {
        let source_path = self.lookup_source_path(source_path);
        let uri = self
            .entries
            .get(&source_path)
            .filter(|entry| entry.identity)
            .map(|entry| entry.document.shadow_uri.clone());
        if uri.is_some() {
            self.remove_source(&source_path)?;
        }
        Ok(uri)
    }

    /// Re-project a source using its current on-disk contents.
    pub fn update_from_disk(
        &mut self,
        source_path: &Path,
        version: i32,
    ) -> Result<ShadowDocument, TsgoOverlayError> {
        let source_path = self.confined_source(source_path)?;
        let text = fs::read_to_string(&source_path)?;
        self.open_or_update(&source_path, &text, version)
    }

    /// Close an editor buffer while keeping its project shadow eagerly open.
    ///
    /// If the source remains on disk, the returned document contains a fresh
    /// disk projection and should be sent as `didChange`. If the source was
    /// deleted, its route is removed and `None` is returned; the caller should
    /// send `didClose` for the previously known shadow URI.
    pub fn close(
        &mut self,
        source_path: &Path,
    ) -> Result<Option<ShadowDocument>, TsgoOverlayError> {
        let source_path = self.confined_source(source_path)?;
        let next_version = self
            .entries
            .get(&source_path)
            .map_or(0, |entry| entry.document.version.saturating_add(1));
        match fs::read_to_string(&source_path) {
            Ok(text) => self
                .open_or_update(&source_path, &text, next_version)
                .map(Some),
            Err(error) if error.kind() == io::ErrorKind::NotFound => {
                self.remove_source(&source_path)?;
                Ok(None)
            }
            Err(error) => Err(error.into()),
        }
    }

    /// Reconcile eager shadows with the current workspace tree.
    pub fn refresh(&mut self) -> Result<OverlayUpdate, TsgoOverlayError> {
        let discovered = rsvelte_check::find_svelte_files(&self.workspace, &[])
            .into_iter()
            .map(|path| fs::canonicalize(&path).unwrap_or(path))
            .collect::<BTreeSet<_>>();
        let known = self
            .entries
            .iter()
            .filter(|(_, entry)| !entry.identity)
            .map(|(path, _)| path.clone())
            .collect::<BTreeSet<_>>();
        let mut update = OverlayUpdate::default();

        for removed in known.difference(&discovered) {
            if let Some(entry) = self.entries.get(removed) {
                update.closed.push(entry.document.shadow_uri.clone());
            }
            self.remove_source(removed)?;
        }
        for path in &discovered {
            let text = fs::read_to_string(path)?;
            let unchanged = self
                .entries
                .get(path)
                .is_some_and(|entry| entry.source_text == text);
            if unchanged {
                continue;
            }
            let version = self
                .entries
                .get(path)
                .map_or(0, |entry| entry.document.version.saturating_add(1));
            update
                .opened_or_changed
                .push(self.open_or_update(path, &text, version)?);
        }
        Ok(update)
    }

    /// Resolve a source path to its virtual shadow document.
    #[must_use]
    pub fn shadow_for_source(&self, source_path: &Path) -> Option<&ShadowDocument> {
        let path = self.lookup_source_path(source_path);
        self.entries.get(&path).map(|entry| &entry.document)
    }

    /// URI a `.svelte` source would use after a prospective file rename.
    pub fn prospective_shadow_uri(&self, source_path: &Path) -> Result<Uri, TsgoOverlayError> {
        let source_path = self.confined_source(source_path)?;
        path_to_uri(&self.shadow_path_for(&source_path)?)
    }

    /// Resolve a virtual shadow path to its original source path.
    #[must_use]
    pub fn source_for_shadow(&self, shadow_path: &Path) -> Option<&Path> {
        let shadow_path = absolute_normalized(shadow_path);
        self.by_shadow.get(&shadow_path).map(PathBuf::as_path)
    }

    /// Every shadow that must be replayed after starting or restarting tsgo.
    #[must_use]
    pub fn eager_shadows(&self) -> Vec<&ShadowDocument> {
        self.entries
            .values()
            .filter(|entry| !entry.identity)
            .map(|entry| &entry.document)
            .collect()
    }

    /// Every open virtual document owned by this workspace.
    #[must_use]
    pub fn open_shadows(&self) -> Vec<&ShadowDocument> {
        self.entries.values().map(|entry| &entry.document).collect()
    }

    /// Exact mapping segments retained for one source projection.
    #[must_use]
    pub fn projection_map(&self, source_path: &Path) -> Option<&ProjectionMap> {
        let path = self.lookup_source_path(source_path);
        self.entries.get(&path).map(|entry| &entry.exact_map)
    }

    /// Original source text retained alongside one projection.
    #[must_use]
    pub fn source_text(&self, source_path: &Path) -> Option<&str> {
        let path = self.lookup_source_path(source_path);
        self.entries
            .get(&path)
            .map(|entry| entry.source_text.as_str())
    }

    /// Standard source map retained for rewritten-template position fallback.
    #[must_use]
    pub fn source_map(&self, source_path: &Path) -> Option<&str> {
        let path = self.lookup_source_path(source_path);
        self.entries
            .get(&path)
            .and_then(|entry| entry.source_map.as_deref())
    }

    /// Map an editor UTF-16 position to the tsgo UTF-8 shadow position.
    #[must_use]
    pub fn map_source_position(&self, source_path: &Path, position: Position) -> Option<Position> {
        let path = self.lookup_source_path(source_path);
        let entry = self.entries.get(&path)?;
        let source_offset = entry.source_index.offset(&entry.source_text, position);

        if entry.identity {
            let generated_offset = source_offset
                + entry
                    .plain_insertions
                    .iter()
                    .filter(|(source, _)| *source <= source_offset)
                    .map(|(_, generated)| generated.len())
                    .sum::<usize>();
            return Some(utf8_position(&entry.document.text, generated_offset));
        }

        if let Some(generated) = exact_source_offset(&entry.exact_map, source_offset) {
            return Some(utf8_position(&entry.document.text, generated as usize));
        }

        let source_position = entry
            .source_index
            .position(&entry.source_text, source_offset);
        let token = closest_source_token(&entry.tokens, source_position)?;
        let generated_offset = entry.generated_index.offset(
            &entry.document.text,
            Position::new(token.generated_line, token.generated_column),
        );
        Some(utf8_position(&entry.document.text, generated_offset))
    }

    /// Map an editor UTF-16 range to the tsgo UTF-8 shadow range.
    #[must_use]
    pub fn map_source_range(&self, source_path: &Path, range: Range) -> Option<Range> {
        let start = self.map_source_position(source_path, range.start)?;
        let end = self.map_source_position(source_path, range.end)?;
        Some(ordered_range(start, end))
    }

    /// Map a tsgo UTF-8 position back to the editor's UTF-16 source position.
    #[must_use]
    pub fn map_generated_position(
        &self,
        shadow_path: &Path,
        position: Position,
    ) -> Option<Position> {
        let source_path = self.source_for_shadow(shadow_path)?;
        let entry = self.entries.get(source_path)?;
        let generated_offset = utf8_offset(&entry.document.text, position);
        if entry.identity {
            if entry
                .plain_insertions
                .iter()
                .any(|(_, generated)| generated.contains(&generated_offset))
            {
                return None;
            }
            let source_offset = generated_offset
                - entry
                    .plain_insertions
                    .iter()
                    .filter(|(_, generated)| generated.end <= generated_offset)
                    .map(|(_, generated)| generated.len())
                    .sum::<usize>();
            return Some(
                entry
                    .source_index
                    .position(&entry.source_text, source_offset),
            );
        }
        if entry
            .generated_ranges
            .iter()
            .any(|range| range.contains(&generated_offset))
        {
            return None;
        }

        if let Some(source) = exact_generated_offset(&entry.exact_map, generated_offset) {
            return Some(
                entry
                    .source_index
                    .position(&entry.source_text, source as usize),
            );
        }

        let generated_utf16 = entry
            .generated_index
            .position(&entry.document.text, generated_offset);
        let index = entry.tokens.partition_point(|token| {
            (token.generated_line, token.generated_column)
                <= (generated_utf16.line, generated_utf16.character)
        });
        let previous = index.checked_sub(1).and_then(|i| entry.tokens.get(i))?;
        if generated_is_unmapped_gap(&entry.tokens, index, generated_utf16) {
            return None;
        }
        previous
            .source
            .map(|(line, column)| Position::new(line, column))
    }

    /// Map a tsgo UTF-8 range back to the editor's UTF-16 source range.
    #[must_use]
    pub fn map_generated_range(&self, shadow_path: &Path, range: Range) -> Option<Range> {
        if self.is_generated_range(shadow_path, range) {
            return None;
        }
        let start = self.map_generated_position(shadow_path, range.start)?;
        let end = self.map_generated_position(shadow_path, range.end)?;
        Some(ordered_range(start, end))
    }

    /// Whether a tsgo position falls inside an `Ωignore` generated-code region.
    #[must_use]
    pub fn is_generated_position(&self, shadow_path: &Path, position: Position) -> bool {
        let Some(source_path) = self.source_for_shadow(shadow_path) else {
            return false;
        };
        let Some(entry) = self.entries.get(source_path) else {
            return false;
        };
        let offset = utf8_offset(&entry.document.text, position);
        entry
            .generated_ranges
            .iter()
            .any(|range| range.contains(&offset))
    }

    /// Whether any byte of a tsgo range intersects generated-code markers.
    #[must_use]
    pub fn is_generated_range(&self, shadow_path: &Path, range: Range) -> bool {
        let Some(source_path) = self.source_for_shadow(shadow_path) else {
            return false;
        };
        let Some(entry) = self.entries.get(source_path) else {
            return false;
        };
        let start = utf8_offset(&entry.document.text, range.start);
        let end = utf8_offset(&entry.document.text, range.end).max(start);
        entry
            .generated_ranges
            .iter()
            .any(|generated| generated.start < end && start < generated.end)
    }

    /// Resolution integrity for every eager shadow.
    #[must_use]
    pub fn resolution_info(&self) -> Vec<ShadowResolutionInfo> {
        self.entries
            .values()
            .filter(|entry| !entry.identity)
            .map(|entry| ShadowResolutionInfo {
                source_path: entry.source_path.clone(),
                shadow_path: entry.shadow_path.clone(),
                source_in_workspace: entry.source_path.starts_with(&self.workspace),
                shadow_in_cache: entry.shadow_path.starts_with(&self.shadow_dir),
                parent_directory_exists: entry.shadow_path.parent().is_some_and(Path::is_dir),
                shadow_registered: self
                    .by_shadow
                    .get(&entry.shadow_path)
                    .is_some_and(|source| source == &entry.source_path),
                included_by_overlay_config: entry
                    .shadow_path
                    .strip_prefix(&self.shadow_dir)
                    .is_ok_and(|relative| {
                        relative
                            .as_os_str()
                            .to_string_lossy()
                            .ends_with(".svelte.tsx")
                    }),
                body_exists_on_disk: entry.shadow_path.exists(),
            })
            .collect()
    }

    /// Routes that would be vulnerable to silent ambient-any degradation.
    #[must_use]
    pub fn unresolved_shadow_routes(&self) -> Vec<ShadowResolutionInfo> {
        self.resolution_info()
            .into_iter()
            .filter(|info| !info.is_resolvable())
            .collect()
    }

    fn projection_options(
        &self,
        source_path: &Path,
        shadow_path: &Path,
        source: &str,
    ) -> Svelte2TsxOptions {
        Svelte2TsxOptions {
            filename: source_path.display().to_string(),
            is_ts_file: looks_like_typescript(source),
            mode: Svelte2TsxMode::Ts,
            accessors: self.accessors,
            namespace: self.namespace,
            version: SvelteVersion::V5,
            runes: None,
            emit_jsdoc: true,
            rewrite_external_imports: Some(RewriteExternalImportsOptions {
                source_path: source_path.display().to_string(),
                generated_path: shadow_path.display().to_string(),
                workspace_path: self.workspace.display().to_string(),
            }),
        }
    }

    fn materialize_support_files(&self) -> Result<(), TsgoOverlayError> {
        reject_symlink_components(&self.cache_dir, &self.cache_dir)?;
        let shims = self.cache_dir.join(SHIM_SHIMS_NAME);
        let jsx = self.cache_dir.join(SHIM_JSX_NAME);
        reject_symlink_components(&shims, &self.cache_dir)?;
        reject_symlink_components(&jsx, &self.cache_dir)?;
        write_if_changed(&shims, SHIM_SHIMS)?;
        write_if_changed(&jsx, SHIM_JSX)?;
        self.write_tsconfig()
    }

    fn write_tsconfig(&self) -> Result<(), TsgoOverlayError> {
        let specs = self
            .source_tsconfig
            .as_deref()
            .map(read_tsconfig_specs)
            .unwrap_or_default();
        let mut include = vec!["svelte/**/*".to_string()];
        if let Some(user_include) = specs.include {
            include.extend(user_include);
        } else if specs.files.is_none() {
            let root = self
                .source_tsconfig
                .as_deref()
                .and_then(Path::parent)
                .unwrap_or(&self.workspace);
            include.push(format!("{}/**/*", path_for_tsconfig(root)));
        }
        let mut files = vec![SHIM_SHIMS_NAME.to_string(), SHIM_JSX_NAME.to_string()];
        files.extend(specs.files.unwrap_or_default());
        let mut config = json!({
            "compilerOptions": {
                "allowArbitraryExtensions": true,
                "allowImportingTsExtensions": true,
                "jsx": "preserve",
                "noEmit": true,
                "rootDirs": [
                    path_for_tsconfig(&self.workspace),
                    path_for_tsconfig(&self.shadow_dir)
                ]
            },
            "files": files,
            "include": include
        });
        if let Some(source) = &self.source_tsconfig {
            config["extends"] = json!(path_for_tsconfig(source));
        }
        if let Some(exclude) = specs.exclude {
            config["exclude"] = json!(exclude);
        }
        let mut text = serde_json::to_string_pretty(&config).expect("JSON values are serializable");
        text.push('\n');
        reject_symlink_components(&self.tsconfig_path, &self.cache_dir)?;
        write_if_changed(&self.tsconfig_path, &text)
    }

    fn shadow_path_for(&self, source_path: &Path) -> Result<PathBuf, TsgoOverlayError> {
        let relative = source_path.strip_prefix(&self.workspace).map_err(|_| {
            TsgoOverlayError::InvalidSource {
                path: source_path.to_path_buf(),
                reason: "source escapes the workspace",
            }
        })?;
        if relative.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        }) {
            return Err(TsgoOverlayError::InvalidSource {
                path: source_path.to_path_buf(),
                reason: "source contains an escaping path component",
            });
        }
        let mut shadow = self.shadow_dir.join(relative).into_os_string();
        shadow.push(".tsx");
        Ok(PathBuf::from(shadow))
    }

    fn ensure_shadow_parent(&self, shadow_path: &Path) -> Result<(), TsgoOverlayError> {
        let parent = shadow_path
            .parent()
            .ok_or_else(|| TsgoOverlayError::InvalidSource {
                path: shadow_path.to_path_buf(),
                reason: "shadow has no parent directory",
            })?;
        reject_symlink_components(parent, &self.cache_dir)?;
        fs::create_dir_all(parent)?;
        reject_symlink_components(parent, &self.cache_dir)?;
        reject_symlink_components(shadow_path, &self.cache_dir)?;
        if shadow_path.exists() {
            return Err(TsgoOverlayError::InvalidSource {
                path: shadow_path.to_path_buf(),
                reason: "diskless shadow path already exists on disk",
            });
        }
        Ok(())
    }

    fn confined_source(&self, source_path: &Path) -> Result<PathBuf, TsgoOverlayError> {
        let lexical = if source_path.is_absolute() {
            absolute_normalized(source_path)
        } else {
            absolute_normalized(&self.workspace.join(source_path))
        };
        if lexical
            .extension()
            .is_none_or(|extension| extension != "svelte")
        {
            return Err(TsgoOverlayError::InvalidSource {
                path: lexical,
                reason: "source does not end in .svelte",
            });
        }
        let existing = nearest_existing_path(&lexical)?;
        let real_existing = fs::canonicalize(existing)?;
        let suffix = lexical
            .strip_prefix(existing)
            .expect("nearest existing path is an ancestor");
        let real = join_existing_suffix(real_existing, suffix);
        if !real.starts_with(&self.workspace) {
            return Err(TsgoOverlayError::InvalidSource {
                path: lexical,
                reason: "source is redirected outside the workspace by a symlink",
            });
        }
        Ok(fs::canonicalize(&real).unwrap_or(real))
    }

    fn confined_any_source(&self, source_path: &Path) -> Result<PathBuf, TsgoOverlayError> {
        let lexical = if source_path.is_absolute() {
            absolute_normalized(source_path)
        } else {
            absolute_normalized(&self.workspace.join(source_path))
        };
        let existing = nearest_existing_path(&lexical)?;
        let real_existing = fs::canonicalize(existing)?;
        let suffix = lexical
            .strip_prefix(existing)
            .expect("nearest existing path is an ancestor");
        let real = join_existing_suffix(real_existing, suffix);
        if !real.starts_with(&self.workspace) {
            return Err(TsgoOverlayError::InvalidSource {
                path: lexical,
                reason: "source is redirected outside the workspace by a symlink",
            });
        }
        Ok(fs::canonicalize(&real).unwrap_or(real))
    }

    fn lookup_source_path(&self, source_path: &Path) -> PathBuf {
        let path = if source_path.is_absolute() {
            absolute_normalized(source_path)
        } else {
            absolute_normalized(&self.workspace.join(source_path))
        };
        fs::canonicalize(&path).unwrap_or(path)
    }

    fn remove_source(&mut self, source_path: &Path) -> Result<(), TsgoOverlayError> {
        let Some(entry) = self.entries.remove(source_path) else {
            return Ok(());
        };
        self.by_shadow.remove(&entry.shadow_path);
        self.prune_empty_skeleton(entry.shadow_path.parent())
    }

    fn prune_empty_skeleton(&self, mut current: Option<&Path>) -> Result<(), TsgoOverlayError> {
        while let Some(directory) = current {
            if directory == self.shadow_dir {
                break;
            }
            reject_symlink_components(directory, &self.cache_dir)?;
            match fs::remove_dir(directory) {
                Ok(()) => current = directory.parent(),
                Err(error) if error.kind() == io::ErrorKind::DirectoryNotEmpty => break,
                Err(error) if error.kind() == io::ErrorKind::NotFound => {
                    current = directory.parent();
                }
                Err(error) => return Err(error.into()),
            }
        }
        Ok(())
    }
}

fn resolve_tsconfig(workspace: &Path, explicit: Option<&Path>) -> Option<PathBuf> {
    if let Some(explicit) = explicit {
        let path = if explicit.is_absolute() {
            explicit.to_path_buf()
        } else {
            workspace.join(explicit)
        };
        return Some(absolute_normalized(&path));
    }
    ["tsconfig.json", "jsconfig.json"]
        .into_iter()
        .map(|name| workspace.join(name))
        .find(|path| path.is_file())
}

#[derive(Debug, Default)]
struct InheritedConfigSpecs {
    include: Option<Vec<String>>,
    exclude: Option<Vec<String>>,
    files: Option<Vec<String>>,
}

fn read_tsconfig_specs(tsconfig: &Path) -> InheritedConfigSpecs {
    let config_dir = tsconfig.parent().unwrap_or_else(|| Path::new("."));
    let rebase = |key: &str| {
        resolve_config_specs(tsconfig, key).map(|(specs, base)| {
            specs
                .into_iter()
                .filter(|spec| key != "files" || !spec.ends_with(".svelte"))
                .map(|spec| rebase_config_spec(&spec, &base, config_dir))
                .collect()
        })
    };
    InheritedConfigSpecs {
        include: rebase("include"),
        exclude: rebase("exclude"),
        files: rebase("files"),
    }
}

const MAX_EXTENDS_CONFIGS: usize = 32;

fn resolve_config_specs(tsconfig: &Path, key: &str) -> Option<(Vec<String>, PathBuf)> {
    let mut pending = vec![absolute_normalized(tsconfig)];
    let mut seen = BTreeSet::new();
    let mut visited = 0usize;
    while let Some(path) = pending.pop() {
        if visited == MAX_EXTENDS_CONFIGS || !seen.insert(path.clone()) {
            continue;
        }
        visited += 1;
        let Ok(raw) = fs::read_to_string(&path) else {
            continue;
        };
        let Some(parsed) = parse_jsonc(&raw) else {
            continue;
        };
        let base = path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_path_buf();
        if let Some(specs) = parsed.get(key).and_then(serde_json::Value::as_array) {
            return Some((
                specs
                    .iter()
                    .filter_map(serde_json::Value::as_str)
                    .map(str::to_string)
                    .collect(),
                base,
            ));
        }
        let parents = match parsed.get("extends") {
            Some(serde_json::Value::String(parent)) => vec![parent.as_str()],
            Some(serde_json::Value::Array(parents)) => parents
                .iter()
                .filter_map(serde_json::Value::as_str)
                .collect(),
            _ => Vec::new(),
        };
        pending.extend(
            parents
                .into_iter()
                .filter_map(|parent| resolve_extends_target(&base, parent)),
        );
    }
    None
}

fn resolve_extends_target(base: &Path, specifier: &str) -> Option<PathBuf> {
    if specifier.starts_with('.') || Path::new(specifier).is_absolute() {
        return Some(resolve_extends_path(base, specifier));
    }
    let mut cursor = Some(absolute_normalized(base));
    while let Some(directory) = cursor {
        let candidate = directory.join("node_modules").join(specifier);
        for path in config_path_candidates(candidate) {
            if path.is_file() {
                return Some(path);
            }
        }
        cursor = directory.parent().map(Path::to_path_buf);
    }
    None
}

fn resolve_extends_path(base: &Path, specifier: &str) -> PathBuf {
    config_path_candidates(base.join(specifier))
        .into_iter()
        .find(|path| path.exists())
        .unwrap_or_else(|| base.join(specifier))
}

fn config_path_candidates(path: PathBuf) -> Vec<PathBuf> {
    if path.is_dir() {
        return vec![path.join("tsconfig.json")];
    }
    if path.extension().is_none() {
        let mut json = path.clone();
        json.set_extension("json");
        vec![path.join("tsconfig.json"), json, path]
    } else {
        vec![path]
    }
}

fn rebase_config_spec(spec: &str, base: &Path, config_dir: &Path) -> String {
    let project_dir = path_for_tsconfig(config_dir);
    let substituted = spec.replace("${configDir}", &project_dir);
    if Path::new(&substituted).is_absolute() {
        substituted.replace('\\', "/")
    } else {
        path_for_tsconfig(&absolute_normalized(&base.join(substituted)))
    }
}

fn parse_jsonc(source: &str) -> Option<serde_json::Value> {
    serde_json::from_str(&strip_jsonc(&strip_trailing_jsonc_commas(source))).ok()
}

fn strip_trailing_jsonc_commas(source: &str) -> String {
    let without_comments = strip_jsonc(source);
    let bytes = without_comments.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0usize;
    let mut in_string = false;
    let mut escaped = false;
    while index < bytes.len() {
        let byte = bytes[index];
        if in_string {
            output.push(byte);
            if escaped {
                escaped = false;
            } else if byte == b'\\' {
                escaped = true;
            } else if byte == b'"' {
                in_string = false;
            }
            index += 1;
            continue;
        }
        if byte == b'"' {
            in_string = true;
            output.push(byte);
            index += 1;
            continue;
        }
        if byte == b',' {
            let mut next = index + 1;
            while bytes.get(next).is_some_and(u8::is_ascii_whitespace) {
                next += 1;
            }
            if bytes
                .get(next)
                .is_some_and(|next| matches!(next, b'}' | b']'))
            {
                index += 1;
                continue;
            }
        }
        output.push(byte);
        index += 1;
    }
    String::from_utf8(output).ok().unwrap_or_default()
}

fn strip_jsonc(source: &str) -> String {
    let bytes = source.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0usize;
    let mut in_string = false;
    let mut escaped = false;
    while index < bytes.len() {
        let byte = bytes[index];
        if in_string {
            output.push(byte);
            if escaped {
                escaped = false;
            } else if byte == b'\\' {
                escaped = true;
            } else if byte == b'"' {
                in_string = false;
            }
            index += 1;
            continue;
        }
        if byte == b'"' {
            in_string = true;
            output.push(byte);
            index += 1;
            continue;
        }
        if byte == b'/' && index + 1 < bytes.len() {
            match bytes[index + 1] {
                b'/' => {
                    while index < bytes.len() && bytes[index] != b'\n' {
                        index += 1;
                    }
                    continue;
                }
                b'*' => {
                    index += 2;
                    while index + 1 < bytes.len()
                        && !(bytes[index] == b'*' && bytes[index + 1] == b'/')
                    {
                        index += 1;
                    }
                    index = (index + 2).min(bytes.len());
                    continue;
                }
                _ => {}
            }
        }
        output.push(byte);
        index += 1;
    }
    String::from_utf8(output).ok().unwrap_or_default()
}

fn parse_mapping_tokens(
    source_path: &Path,
    raw: Option<&str>,
) -> Result<Vec<MappingToken>, TsgoOverlayError> {
    let Some(raw) = raw else {
        return Ok(Vec::new());
    };
    let map = SourceMap::from_slice(raw.as_bytes()).map_err(|error| {
        TsgoOverlayError::InvalidSourceMap {
            path: source_path.to_path_buf(),
            message: error.to_string(),
        }
    })?;
    let mut tokens = map
        .tokens()
        .map(|token| MappingToken {
            generated_line: token.get_dst_line(),
            generated_column: token.get_dst_col(),
            source: token
                .get_source()
                .map(|_| (token.get_src_line(), token.get_src_col())),
        })
        .collect::<Vec<_>>();
    tokens.sort_by_key(|token| (token.generated_line, token.generated_column));
    Ok(tokens)
}

fn rewrite_plain_svelte_imports(source: &str) -> (String, Vec<(usize, std::ops::Range<usize>)>) {
    let bytes = source.as_bytes();
    let mut insertions = Vec::new();
    let mut index = 0;
    while index < bytes.len() {
        let quote = bytes[index];
        if !matches!(quote, b'\'' | b'"' | b'`') {
            index += 1;
            continue;
        }
        let start = index;
        index += 1;
        let content_start = index;
        while index < bytes.len() {
            if bytes[index] == b'\\' {
                index = (index + 2).min(bytes.len());
                continue;
            }
            if bytes[index] == quote {
                break;
            }
            index += 1;
        }
        if index >= bytes.len() {
            break;
        }
        let content = &source[content_start..index];
        let svelte_end = content
            .rfind(".svelte")
            .map(|offset| content_start + offset + 7);
        let suffix_ok = svelte_end
            .is_some_and(|end| end == index || matches!(bytes.get(end), Some(b'?' | b'#')));
        let prefix = source[..start].trim_end();
        let module_context = prefix.ends_with("from")
            || prefix.ends_with("import")
            || prefix.ends_with("import(")
            || prefix.ends_with("require(");
        if suffix_ok && module_context {
            insertions.push(svelte_end.expect("checked above"));
        }
        index += 1;
    }

    let mut generated = source.to_string();
    for &offset in insertions.iter().rev() {
        generated.insert_str(offset, ".tsx");
    }
    let ranges = insertions
        .into_iter()
        .enumerate()
        .map(|(index, source)| {
            let start = source + index * 4;
            (source, start..start + 4)
        })
        .collect();
    (generated, ranges)
}

fn closest_source_token(tokens: &[MappingToken], source: Position) -> Option<MappingToken> {
    tokens
        .iter()
        .filter_map(|token| {
            let (line, column) = token.source?;
            (line == source.line).then_some((column.abs_diff(source.character), *token))
        })
        .min_by_key(|(distance, token)| (*distance, token.generated_line, token.generated_column))
        .map(|(_, token)| token)
}

fn exact_source_offset(map: &ProjectionMap, offset: usize) -> Option<u32> {
    let offset = u32::try_from(offset).ok()?;
    if let Some(generated) = map.source_to_generated(offset).first() {
        return Some(*generated);
    }
    map.segments()
        .iter()
        .find(|segment| segment.source.end() == offset)
        .map(|segment| segment.generated.end())
}

fn exact_generated_offset(map: &ProjectionMap, offset: usize) -> Option<u32> {
    let offset = u32::try_from(offset).ok()?;
    if let Some(source) = map.generated_to_source(offset) {
        return Some(source);
    }
    map.segments()
        .iter()
        .find(|segment| segment.generated.end() == offset)
        .map(|segment| segment.source.end())
}

fn generated_is_unmapped_gap(
    tokens: &[MappingToken],
    next_index: usize,
    position: Position,
) -> bool {
    let Some(previous) = next_index.checked_sub(1).and_then(|i| tokens.get(i)) else {
        return true;
    };
    if (previous.generated_line, previous.generated_column) == (position.line, position.character) {
        return previous.source.is_none();
    }
    let Some(next) = tokens.get(next_index) else {
        return false;
    };
    next.generated_line == position.line
        && previous.source.is_some()
        && previous.source == next.source
}

fn ignored_ranges(text: &str) -> Vec<std::ops::Range<usize>> {
    let mut ranges = Vec::new();
    let mut cursor = 0;
    while let Some(relative_start) = text[cursor..].find(IGNORE_START) {
        let start = cursor + relative_start;
        let content_start = start + IGNORE_START.len();
        let Some(relative_end) = text[content_start..].find(IGNORE_END) else {
            ranges.push(start..text.len());
            break;
        };
        let end = content_start + relative_end + IGNORE_END.len();
        ranges.push(start..end);
        cursor = end;
    }
    ranges
}

fn ordered_range(start: Position, end: Position) -> Range {
    if (start.line, start.character) <= (end.line, end.character) {
        Range::new(start, end)
    } else {
        Range::new(end, start)
    }
}

fn looks_like_typescript(source: &str) -> bool {
    let lower = source.to_ascii_lowercase();
    lower.contains("lang=\"ts\"") || lower.contains("lang='ts'") || lower.contains("lang=ts")
}

fn utf8_position(text: &str, offset: usize) -> Position {
    let offset = floor_char_boundary(text, offset.min(text.len()));
    let line = text.as_bytes()[..offset]
        .iter()
        .filter(|byte| **byte == b'\n')
        .count();
    let line_start = text.as_bytes()[..offset]
        .iter()
        .rposition(|byte| *byte == b'\n')
        .map_or(0, |position| position + 1);
    Position::new(
        u32::try_from(line).unwrap_or(u32::MAX),
        u32::try_from(offset - line_start).unwrap_or(u32::MAX),
    )
}

fn utf8_offset(text: &str, position: Position) -> usize {
    let mut line = 0u32;
    let mut line_start = 0usize;
    for (index, byte) in text.bytes().enumerate() {
        if line == position.line {
            break;
        }
        if byte == b'\n' {
            line += 1;
            line_start = index + 1;
        }
    }
    if line != position.line {
        return text.len();
    }
    let line_end = text[line_start..]
        .find('\n')
        .map_or(text.len(), |relative| line_start + relative);
    floor_char_boundary(
        text,
        line_start
            .saturating_add(position.character as usize)
            .min(line_end),
    )
}

fn floor_char_boundary(text: &str, mut offset: usize) -> usize {
    while offset > 0 && !text.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

fn write_if_changed(path: &Path, contents: &str) -> Result<(), TsgoOverlayError> {
    if fs::read_to_string(path).is_ok_and(|existing| existing == contents) {
        return Ok(());
    }
    fs::write(path, contents)?;
    Ok(())
}

fn reject_symlink_components(path: &Path, cache_dir: &Path) -> io::Result<()> {
    let relative = path.strip_prefix(cache_dir).map_err(|_| {
        io::Error::new(
            io::ErrorKind::PermissionDenied,
            format!("overlay path escapes cache: {}", path.display()),
        )
    })?;
    let mut current = cache_dir.to_path_buf();
    reject_symlink(&current)?;
    for component in relative.components() {
        current.push(component.as_os_str());
        reject_symlink(&current)?;
    }
    Ok(())
}

fn reject_symlink(path: &Path) -> io::Result<()> {
    match fs::symlink_metadata(path) {
        Ok(metadata) if metadata.file_type().is_symlink() => Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            format!("overlay cache path contains a symlink: {}", path.display()),
        )),
        Ok(_) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

fn nearest_existing_path(path: &Path) -> io::Result<&Path> {
    let mut current = Some(path);
    while let Some(candidate) = current {
        match fs::symlink_metadata(candidate) {
            Ok(_) => return Ok(candidate),
            Err(error) if error.kind() == io::ErrorKind::NotFound => {
                current = candidate.parent();
            }
            Err(error) => return Err(error),
        }
    }
    Err(io::Error::new(
        io::ErrorKind::NotFound,
        format!("no existing ancestor for {}", path.display()),
    ))
}

fn join_existing_suffix(existing: PathBuf, suffix: &Path) -> PathBuf {
    if suffix.as_os_str().is_empty() {
        existing
    } else {
        existing.join(suffix)
    }
}

fn absolute_normalized(path: &Path) -> PathBuf {
    let path = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(path)
    };
    let mut normalized = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                if matches!(
                    normalized.components().next_back(),
                    Some(Component::Normal(_))
                ) {
                    normalized.pop();
                }
            }
            other => normalized.push(other.as_os_str()),
        }
    }
    normalized
}

fn path_for_tsconfig(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn path_to_uri(path: &Path) -> Result<Uri, TsgoOverlayError> {
    let path = path_for_tsconfig(path);
    let mut encoded = String::with_capacity(path.len() + 8);
    for byte in path.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'/' | b':' | b'-' | b'_' | b'.' | b'~') {
            encoded.push(char::from(byte));
        } else {
            use std::fmt::Write as _;
            write!(&mut encoded, "%{byte:02X}").expect("writing to String cannot fail");
        }
    }
    let prefix = if encoded.starts_with('/') {
        "file://"
    } else {
        "file:///"
    };
    Uri::from_str(&format!("{prefix}{encoded}"))
        .map_err(|_| TsgoOverlayError::InvalidUri(path.to_owned().into()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    struct TestWorkspace(PathBuf);

    impl TestWorkspace {
        fn new(name: &str) -> Self {
            let nonce = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let root = std::env::temp_dir().join(format!(
                "rsvelte-tsgo-overlay-{name}-{}-{nonce}",
                std::process::id()
            ));
            fs::create_dir_all(&root).unwrap();
            Self(root)
        }
    }

    impl Drop for TestWorkspace {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn write(path: &Path, text: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, text).unwrap();
    }

    #[test]
    fn an_existing_leaf_does_not_gain_an_empty_path_component() {
        let existing = PathBuf::from("/workspace/src/App.svelte");
        assert_eq!(
            join_existing_suffix(existing.clone(), Path::new("")),
            existing
        );
    }

    #[test]
    fn build_is_diskless_and_discovers_project_components() {
        let workspace = TestWorkspace::new("build");
        let app = workspace.0.join("src/App.svelte");
        let nested = workspace.0.join("src/lib/Nested.svelte");
        write(&app, "<h1>Hello</h1>");
        write(&nested, "<p>Nested</p>");
        write(
            &workspace.0.join("node_modules/pkg/Skipped.svelte"),
            "<p>skip</p>",
        );

        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        assert_eq!(overlay.eager_shadows().len(), 2);
        let shadow = overlay.shadow_for_source(&app).unwrap();
        let shadow_path = overlay.shadow_dir.join("src/App.svelte.tsx");
        assert_eq!(shadow.shadow_uri, path_to_uri(&shadow_path).unwrap());
        assert!(shadow_path.parent().unwrap().is_dir());
        assert!(!shadow_path.exists());
        assert!(overlay.tsconfig_path().is_file());
        assert!(overlay.cache_dir().join(SHIM_SHIMS_NAME).is_file());
        assert!(overlay.cache_dir().join(SHIM_JSX_NAME).is_file());
        assert!(overlay.unresolved_shadow_routes().is_empty());
    }

    #[test]
    fn overlay_config_merges_inherited_plain_project_specs() {
        let workspace = TestWorkspace::new("config-specs");
        write(
            &workspace.0.join("configs/base.json"),
            r#"{
                // inherited independently from the root config
                "include": ["../src/**/*.ts",],
                "files": ["../ambient.d.ts", "../Ignored.svelte"],
                "exclude": ["../src/generated/**"]
            }"#,
        );
        write(
            &workspace.0.join("tsconfig.json"),
            r#"{ "extends": "./configs/base.json", "compilerOptions": { "strict": true } }"#,
        );
        write(&workspace.0.join("src/main.ts"), "export const main = 1;");
        write(
            &workspace.0.join("ambient.d.ts"),
            "declare const ambient: 1;",
        );
        write(&workspace.0.join("App.svelte"), "<p>{ambient}</p>");

        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let config: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(overlay.tsconfig_path()).unwrap()).unwrap();
        let include = config["include"].as_array().unwrap();
        assert!(include.contains(&json!("svelte/**/*")));
        assert!(include.contains(&json!(path_for_tsconfig(
            &overlay.workspace().join("src/**/*.ts")
        ))));
        let files = config["files"].as_array().unwrap();
        assert!(files.contains(&json!(SHIM_SHIMS_NAME)));
        assert!(files.contains(&json!(SHIM_JSX_NAME)));
        assert!(files.contains(&json!(path_for_tsconfig(
            &overlay.workspace().join("ambient.d.ts")
        ))));
        assert!(!files.iter().any(|file| {
            file.as_str()
                .is_some_and(|file| file.ends_with("Ignored.svelte"))
        }));
        assert_eq!(
            config["exclude"],
            json!([path_for_tsconfig(
                &overlay.workspace().join("src/generated/**")
            )])
        );
    }

    #[test]
    fn config_without_file_specs_keeps_default_plain_project_membership() {
        let workspace = TestWorkspace::new("config-default-include");
        write(
            &workspace.0.join("tsconfig.json"),
            r#"{ "compilerOptions": { "strict": true } }"#,
        );
        write(&workspace.0.join("src/main.ts"), "export const main = 1;");
        write(&workspace.0.join("App.svelte"), "<p />");

        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let config: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(overlay.tsconfig_path()).unwrap()).unwrap();
        assert!(
            config["include"]
                .as_array()
                .unwrap()
                .contains(&json!(format!(
                    "{}/**/*",
                    path_for_tsconfig(overlay.workspace())
                )))
        );
    }

    #[test]
    fn open_update_close_keeps_or_removes_the_eager_shadow() {
        let workspace = TestWorkspace::new("lifecycle");
        let app = workspace.0.join("src/App.svelte");
        write(&app, "<p>disk</p>");
        let mut overlay = TsgoOverlay::build(&workspace.0, None).unwrap();

        let changed = overlay.open_or_update(&app, "<p>buffer</p>", 7).unwrap();
        assert_eq!(changed.version, 7);
        assert_eq!(fs::read_to_string(&app).unwrap(), "<p>disk</p>");
        assert_eq!(
            overlay
                .entries
                .get(&fs::canonicalize(&app).unwrap())
                .unwrap()
                .source_text,
            "<p>buffer</p>"
        );
        let reverted = overlay.close(&app).unwrap().unwrap();
        assert_eq!(reverted.version, 8);
        assert_eq!(
            overlay
                .entries
                .get(&fs::canonicalize(&app).unwrap())
                .unwrap()
                .source_text,
            "<p>disk</p>"
        );

        fs::remove_file(&app).unwrap();
        assert!(overlay.close(&app).unwrap().is_none());
        assert!(overlay.shadow_for_source(&app).is_none());
        assert!(!overlay.shadow_dir.join("src").exists());
    }

    #[test]
    fn plain_buffers_join_the_overlay_project_without_disk_bodies() {
        let workspace = TestWorkspace::new("plain");
        let source = workspace.0.join("src/main.ts");
        write(&source, "const face = '😀';\nface;\n");
        let mut overlay = TsgoOverlay::build(&workspace.0, None).unwrap();

        let shadow = overlay
            .open_plain(&source, "const face = '😀';\nface;\n", 3, "typescript")
            .unwrap();
        let shadow_path = overlay.shadow_dir.join("src/main.ts");
        assert_eq!(shadow.shadow_uri, path_to_uri(&shadow_path).unwrap());
        assert!(!shadow_path.exists());
        assert_eq!(overlay.eager_shadows().len(), 0);
        assert_eq!(
            overlay.map_source_position(&source, Position::new(0, 17)),
            Some(Position::new(0, 19))
        );
        assert_eq!(
            overlay.map_generated_position(&shadow_path, Position::new(0, 19)),
            Some(Position::new(0, 17))
        );
        assert_eq!(
            overlay.close_plain(&source).unwrap(),
            Some(shadow.shadow_uri)
        );
        assert!(overlay.shadow_for_source(&source).is_none());
    }

    #[test]
    fn plain_module_specifiers_target_open_svelte_shadows() {
        let source = "import App from './App.svelte';\nApp;\n";
        let (generated, insertions) = rewrite_plain_svelte_imports(source);
        assert_eq!(generated, "import App from './App.svelte.tsx';\nApp;\n");
        assert_eq!(insertions.len(), 1);
        assert_eq!(&generated[insertions[0].1.clone()], ".tsx");
    }

    #[test]
    fn component_query_anchor_survives_overlay_import_rewriting() {
        use lsp_types::{CompletionContext, CompletionTriggerKind};

        let workspace = TestWorkspace::new("component-query");
        let app = workspace.0.join("App.svelte");
        let source =
            "<script lang=\"ts\">\n  import Child from './Child.svelte';\n</script>\n<Child  />\n";
        write(&app, source);
        write(&workspace.0.join("Child.svelte"), "<p>child</p>");
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let cursor = LineIndex::new(source).position(source, source.rfind("  ").unwrap() + 1);
        let site = crate::tsgo_component_info::component_completion_site(
            source,
            cursor,
            Some(&CompletionContext {
                trigger_kind: CompletionTriggerKind::INVOKED,
                trigger_character: None,
            }),
            false,
        )
        .unwrap();
        let shadow = overlay.shadow_for_source(&app).unwrap();
        assert!(shadow.text.contains("from './Child.svelte.tsx'"));
        let ranges = crate::tsgo_component_info::generated_component_ranges(
            overlay.projection_map(&app).unwrap(),
            &site,
            &shadow.text,
        );
        assert_eq!(ranges.len(), 1, "{}", shadow.text);
        assert_eq!(&shadow.text[ranges[0].clone()], "Child");
        let source_position =
            LineIndex::new(source).position(source, source.find("Child").unwrap());
        let generated_position = overlay.map_source_position(&app, source_position).unwrap();
        assert_eq!(
            overlay.map_generated_position(
                &overlay.shadow_dir.join("App.svelte.tsx"),
                generated_position
            ),
            Some(source_position)
        );
    }

    #[test]
    fn positions_cross_utf16_and_utf8_only_at_the_editor_boundary() {
        let workspace = TestWorkspace::new("positions");
        let app = workspace.0.join("src/App.svelte");
        let source = "<script lang=\"ts\">\nconst 名前 = \"💡\";\nconsole.log(名前);\n</script>\n";
        write(&app, source);
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let shadow_path = overlay.shadow_dir.join("src/App.svelte.tsx");
        let source_offset = source.rfind("名前").unwrap();
        let source_position = LineIndex::new(source).position(source, source_offset);
        let generated = overlay
            .map_source_position(&app, source_position)
            .expect("script identifier maps forward");
        let back = overlay
            .map_generated_position(&shadow_path, generated)
            .expect("generated identifier maps back");
        assert_eq!(back, source_position);
    }

    #[test]
    fn source_map_supplies_a_fallback_for_rewritten_markup() {
        let workspace = TestWorkspace::new("fallback");
        let app = workspace.0.join("App.svelte");
        let source = "<input bind:value={value}>";
        write(&app, source);
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let opener = Position::new(0, 0);
        assert!(
            overlay.map_source_position(&app, opener).is_some(),
            "rewritten template offsets must not inherit ProjectionMap's holes"
        );
    }

    #[test]
    fn generated_ignore_regions_are_not_mapped_back() {
        let text = "a/*Ωignore_startΩ*/hidden/*Ωignore_endΩ*/b";
        let ranges = ignored_ranges(text);
        assert_eq!(ranges.len(), 1);
        assert!(ranges[0].contains(&text.find("hidden").unwrap()));
        assert!(!ranges[0].contains(&0));

        let workspace = TestWorkspace::new("ignore-map");
        let app = workspace.0.join("App.svelte");
        write(&app, "<script>export let value;</script><p>{value}</p>");
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let shadow_path = overlay.shadow_dir.join("App.svelte.tsx");
        let shadow = overlay.shadow_for_source(&app).unwrap();
        let ignored = shadow.text.find(IGNORE_START).unwrap() + IGNORE_START.len();
        let position = utf8_position(&shadow.text, ignored);
        assert!(overlay.is_generated_position(&shadow_path, position));
        assert_eq!(overlay.map_generated_position(&shadow_path, position), None);
    }

    #[cfg(unix)]
    #[test]
    fn cache_symlink_is_rejected_before_any_write_through_it() {
        use std::os::unix::fs::symlink;

        let workspace = TestWorkspace::new("symlink");
        let outside = TestWorkspace::new("outside");
        let cache_parent = workspace.0.join(CACHE_DIRECTORY);
        fs::create_dir_all(&cache_parent).unwrap();
        symlink(&outside.0, cache_parent.join(TSGO_DIRECTORY)).unwrap();
        let error = TsgoOverlay::build(&workspace.0, None).unwrap_err();
        assert!(error.to_string().contains("symlink"));
        assert!(fs::read_dir(&outside.0).unwrap().next().is_none());
    }
}
