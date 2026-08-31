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
use rsvelte_check::overlay::{SHIM_FILES, global_type_files};
use rsvelte_projection::{
    ProjectionEngine, ProjectionMap, RewriteExternalImportsOptions, Svelte2TsxMode,
    Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, is_typescript_component,
};
use serde_json::json;
use sourcemap::{SourceMap, SourceMapBuilder};

use crate::text::LineIndex;

const CACHE_DIRECTORY: &str = ".rsvelte-language-server";
const TSGO_DIRECTORY: &str = "tsgo";
const SHADOW_DIRECTORY: &str = "svelte";
const OVERLAY_TSCONFIG: &str = "tsconfig.json";
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

#[derive(Debug, Clone, Copy)]
struct ReverseMappingToken {
    source_line: u32,
    source_column: u32,
    generated_line: u32,
    generated_column: u32,
}

#[derive(Debug, Default)]
struct PreprocessMappings {
    generated: Vec<MappingToken>,
    original: Vec<ReverseMappingToken>,
}

/// Whether a Svelte projection used a user-preprocessed document.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PreprocessStatus {
    /// Original and preprocessed texts are identical.
    Identity,
    /// Changed preprocessed text has a usable source map back to the original.
    Mapped,
    /// Changed preprocessed text has no source map and cannot be mapped safely.
    Unmapped,
}

struct ShadowState {
    document: ShadowDocument,
    source_path: PathBuf,
    shadow_path: PathBuf,
    source_text: String,
    source_index: LineIndex,
    preprocessed_text: Option<String>,
    preprocessed_index: Option<LineIndex>,
    preprocess_map: Option<String>,
    preprocess_mappings: PreprocessMappings,
    preprocess_status: PreprocessStatus,
    generated_index: LineIndex,
    exact_map: ProjectionMap,
    source_map: Option<String>,
    tokens: Vec<MappingToken>,
    generated_ranges: Vec<std::ops::Range<usize>>,
    identity: bool,
    plain_insertions: Vec<(usize, std::ops::Range<usize>)>,
    /// Byte offset in `source_text` that generated offset 0 corresponds to,
    /// for the `FragmentMapper` upstream installs when there is no projection.
    fragment_offset: usize,
    /// svelte2tsx's message, when this shadow is the parser-error fallback.
    parser_error: Option<String>,
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
        self.open_or_update_preprocessed(source_path, text, text, None, version)
    }

    /// Generate or replace one virtual shadow from a preprocessed Svelte document.
    ///
    /// `preprocess_map` is a standard v3 map from `preprocessed_text` back to
    /// `original_text`. Changed text without a map remains usable by tsgo, but
    /// editor positions cannot be mapped safely.
    pub fn open_or_update_preprocessed(
        &mut self,
        source_path: &Path,
        original_text: &str,
        preprocessed_text: &str,
        preprocess_map: Option<&str>,
        version: i32,
    ) -> Result<ShadowDocument, TsgoOverlayError> {
        let source_path = self.confined_source(source_path)?;
        let shadow_path = self.shadow_path_for(&source_path)?;
        self.ensure_shadow_parent(&shadow_path)?;

        let preprocess_status = if original_text == preprocessed_text {
            PreprocessStatus::Identity
        } else if preprocess_map.is_some() {
            PreprocessStatus::Mapped
        } else {
            PreprocessStatus::Unmapped
        };
        let preprocess_mappings = if preprocess_status == PreprocessStatus::Mapped {
            parse_preprocess_mappings(
                &source_path,
                preprocess_map.expect("mapped preprocessing has a map"),
            )?
        } else {
            PreprocessMappings::default()
        };

        let options = self.projection_options(&source_path, &shadow_path, preprocessed_text);
        let artifact = match self.engine.project(preprocessed_text, options) {
            Ok(artifact) => artifact,
            // `DocumentSnapshot.ts:275-291`: a rejected document still gets a
            // snapshot, over its extracted script, so TypeScript keeps answering.
            Err(error) => {
                return self.open_parser_error_fallback(
                    &source_path,
                    &shadow_path,
                    original_text,
                    version,
                    error.to_string(),
                );
            }
        };
        let mut exact_map = if preprocess_status == PreprocessStatus::Identity {
            artifact.exact_mappings.unwrap_or_default()
        } else {
            ProjectionMap::default()
        };
        let projection_source_map = artifact.source_map;
        let mut tokens = parse_mapping_tokens(&source_path, projection_source_map.as_deref())?;
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
        let generated_index = LineIndex::new(&generated_text);
        let source_map = compose_source_map(
            &source_path,
            original_text,
            projection_source_map.as_deref(),
            &tokens,
            &preprocess_mappings,
            preprocess_status,
            &generated_text,
            &generated_index,
            &import_insertions,
        )?;
        let document = ShadowDocument {
            source_uri: path_to_uri(&source_path)?,
            shadow_uri: path_to_uri(&shadow_path)?,
            language_id: shadow_language_id(preprocessed_text).to_string(),
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
            source_text: original_text.to_string(),
            source_index: LineIndex::new(original_text),
            preprocessed_text: (preprocess_status != PreprocessStatus::Identity)
                .then(|| preprocessed_text.to_string()),
            preprocessed_index: (preprocess_status != PreprocessStatus::Identity)
                .then(|| LineIndex::new(preprocessed_text)),
            preprocess_map: preprocess_map.map(str::to_string),
            preprocess_mappings,
            preprocess_status,
            generated_index,
            exact_map,
            source_map,
            tokens,
            generated_ranges,
            identity: false,
            plain_insertions: Vec::new(),
            fragment_offset: 0,
            parser_error: None,
            document: document.clone(),
        };
        if let Some(old) = self.entries.insert(source_path.clone(), state) {
            self.by_shadow.remove(&old.shadow_path);
        }
        self.by_shadow.insert(shadow_path, source_path);
        Ok(document)
    }

    /// The snapshot upstream keeps when svelte2tsx rejects a document: the
    /// instance script's body (else the module script's, else nothing) mapped
    /// back by a constant shift, so TypeScript still answers and every caller
    /// can see that the projection failed.
    fn open_parser_error_fallback(
        &mut self,
        source_path: &Path,
        shadow_path: &Path,
        original_text: &str,
        version: i32,
        message: String,
    ) -> Result<ShadowDocument, TsgoOverlayError> {
        let fragment = crate::context::fallback_script_body(original_text);
        let fragment_offset = fragment.as_ref().map_or(0, |body| body.start);
        let generated_text = fragment
            .and_then(|body| original_text.get(body))
            .unwrap_or("")
            .to_string();
        let document = ShadowDocument {
            source_uri: path_to_uri(source_path)?,
            shadow_uri: path_to_uri(shadow_path)?,
            language_id: shadow_language_id(original_text).to_string(),
            text: generated_text.clone(),
            version,
        };
        let state = ShadowState {
            source_path: source_path.to_path_buf(),
            shadow_path: shadow_path.to_path_buf(),
            source_text: original_text.to_string(),
            source_index: LineIndex::new(original_text),
            preprocessed_text: None,
            preprocessed_index: None,
            preprocess_map: None,
            preprocess_mappings: PreprocessMappings::default(),
            preprocess_status: PreprocessStatus::Identity,
            generated_index: LineIndex::new(&generated_text),
            exact_map: ProjectionMap::default(),
            tokens: Vec::new(),
            source_map: None,
            generated_ranges: Vec::new(),
            identity: true,
            plain_insertions: Vec::new(),
            fragment_offset,
            parser_error: Some(message),
            document: document.clone(),
        };
        if let Some(old) = self.entries.insert(source_path.to_path_buf(), state) {
            self.by_shadow.remove(&old.shadow_path);
        }
        self.by_shadow
            .insert(shadow_path.to_path_buf(), source_path.to_path_buf());
        Ok(document)
    }

    /// svelte2tsx's message for a document whose projection failed.
    #[must_use]
    pub fn parser_error(&self, source_path: &Path) -> Option<&str> {
        let path = self.lookup_source_path(source_path);
        self.entries.get(&path)?.parser_error.as_deref()
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
            preprocessed_text: None,
            preprocessed_index: None,
            preprocess_map: None,
            preprocess_mappings: PreprocessMappings::default(),
            preprocess_status: PreprocessStatus::Identity,
            generated_index: LineIndex::new(text),
            exact_map: ProjectionMap::default(),
            tokens: Vec::new(),
            source_map: None,
            generated_ranges: Vec::new(),
            identity: true,
            plain_insertions,
            fragment_offset: 0,
            parser_error: None,
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

    /// Preprocessed Svelte text used as input to svelte2tsx.
    #[must_use]
    pub fn preprocessed_text(&self, source_path: &Path) -> Option<&str> {
        let path = self.lookup_source_path(source_path);
        self.entries.get(&path).map(|entry| {
            entry
                .preprocessed_text
                .as_deref()
                .unwrap_or(&entry.source_text)
        })
    }

    /// Standard v3 source map supplied by the preprocessor.
    #[must_use]
    pub fn preprocess_map(&self, source_path: &Path) -> Option<&str> {
        let path = self.lookup_source_path(source_path);
        self.entries
            .get(&path)
            .and_then(|entry| entry.preprocess_map.as_deref())
    }

    /// Mapping status of the preprocessed Svelte input.
    #[must_use]
    pub fn preprocess_status(&self, source_path: &Path) -> Option<PreprocessStatus> {
        let path = self.lookup_source_path(source_path);
        self.entries.get(&path).map(|entry| entry.preprocess_status)
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
            let generated_offset = source_offset.saturating_sub(entry.fragment_offset)
                + entry
                    .plain_insertions
                    .iter()
                    .filter(|(source, _)| *source <= source_offset)
                    .map(|(_, generated)| generated.len())
                    .sum::<usize>();
            return Some(utf8_position(&entry.document.text, generated_offset));
        }

        if entry.preprocess_status == PreprocessStatus::Identity
            && let Some(generated) = exact_source_offset(&entry.exact_map, source_offset)
        {
            return Some(utf8_position(&entry.document.text, generated as usize));
        }

        let original_position = entry
            .source_index
            .position(&entry.source_text, source_offset);
        let preprocessed_position = map_original_to_preprocessed(entry, original_position)?;
        let preprocessed_text = entry
            .preprocessed_text
            .as_deref()
            .unwrap_or(&entry.source_text);
        let preprocessed_index = entry
            .preprocessed_index
            .as_ref()
            .unwrap_or(&entry.source_index);
        let preprocessed_position = preprocessed_index.position(
            preprocessed_text,
            preprocessed_index.offset(preprocessed_text, preprocessed_position),
        );
        let token = closest_source_token(&entry.tokens, preprocessed_position)?;
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
            let source_offset = entry.fragment_offset + generated_offset
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

        if entry.preprocess_status == PreprocessStatus::Identity
            && let Some(source) = exact_generated_offset(&entry.exact_map, generated_offset)
        {
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
        if previous.generated_line != generated_utf16.line
            || generated_is_unmapped_gap(&entry.tokens, index, generated_utf16)
        {
            return None;
        }
        let (line, column) = previous.source?;
        map_preprocessed_to_original(entry, Position::new(line, column))
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
            is_ts_file: is_typescript_component(source),
            mode: Svelte2TsxMode::Ts,
            accessors: self.accessors,
            namespace: self.namespace,
            version: SvelteVersion::V5,
            runes: None,
            emit_jsdoc: true,
            // `LSAndTSDocResolver.ts:138`: the language server projects a
            // half-typed document; `svelte-check` deliberately does not.
            emit_on_template_error: true,
            rewrite_external_imports: Some(RewriteExternalImportsOptions {
                source_path: source_path.display().to_string(),
                generated_path: shadow_path.display().to_string(),
                workspace_path: self.workspace.display().to_string(),
            }),
            ..Svelte2TsxOptions::default()
        }
    }

    fn materialize_support_files(&self) -> Result<(), TsgoOverlayError> {
        reject_symlink_components(&self.cache_dir, &self.cache_dir)?;
        for (name, contents) in SHIM_FILES {
            let path = self.cache_dir.join(name);
            reject_symlink_components(&path, &self.cache_dir)?;
            write_if_changed(&path, contents)?;
        }
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
        } else if specs.files.is_none()
            && let Some(root) = self.source_tsconfig.as_deref().and_then(Path::parent)
        {
            // With no project config upstream builds its fallback with
            // `include: []` (`service.ts:874-878`, "not to flood the initial
            // files"), so a workspace glob here would put every `.d.ts` in the
            // repository — and its `declare global`s — into the program.
            include.push(format!("{}/**/*", path_for_tsconfig(root)));
        }
        let (shims, svelte_html) = global_type_files(&self.workspace);
        let mut files = shims
            .iter()
            .map(|name| (*name).to_string())
            .collect::<Vec<_>>();
        files.extend(svelte_html.as_deref().map(path_for_tsconfig));
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
        if let Some(target) = overlay_target(self.source_tsconfig.as_deref()) {
            config["compilerOptions"]["target"] = json!(target);
        }
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

/// The `target` the shadow program must be given, or `None` to keep the
/// project's. Mirrors `service.ts:792-795`, where upstream forces
/// `ScriptTarget.Latest` when the project sets no target and raises anything
/// below ES2015 to ES2015 — without it a shadow program is checked against a
/// smaller lib than the editor's own program uses.
fn overlay_target(tsconfig: Option<&Path>) -> Option<&'static str> {
    match tsconfig.and_then(|path| resolve_compiler_option(path, "target")) {
        None => Some("ESNext"),
        Some(target) => {
            matches!(target.to_ascii_lowercase().as_str(), "es3" | "es5").then_some("ES2015")
        }
    }
}

fn resolve_compiler_option(tsconfig: &Path, key: &str) -> Option<String> {
    resolve_config_value(tsconfig, key).and_then(|value| match value {
        serde_json::Value::String(text) => Some(text),
        _ => None,
    })
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

fn resolve_config_value(tsconfig: &Path, key: &str) -> Option<serde_json::Value> {
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
        if let Some(value) = parsed
            .get("compilerOptions")
            .and_then(|options| options.get(key))
        {
            return Some(value.clone());
        }
        let base = path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_path_buf();
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

fn parse_preprocess_mappings(
    source_path: &Path,
    raw: &str,
) -> Result<PreprocessMappings, TsgoOverlayError> {
    let map = SourceMap::from_slice(raw.as_bytes()).map_err(|error| {
        TsgoOverlayError::InvalidSourceMap {
            path: source_path.to_path_buf(),
            message: error.to_string(),
        }
    })?;
    let single_source = map.get_source_count() == 1;
    let mut mappings = PreprocessMappings::default();
    for token in map.tokens() {
        let belongs_to_document = token
            .get_source()
            .is_some_and(|source| single_source || source_matches(source_path, source));
        let source = belongs_to_document.then(|| (token.get_src_line(), token.get_src_col()));
        mappings.generated.push(MappingToken {
            generated_line: token.get_dst_line(),
            generated_column: token.get_dst_col(),
            source,
        });
        if let Some((source_line, source_column)) = source {
            mappings.original.push(ReverseMappingToken {
                source_line,
                source_column,
                generated_line: token.get_dst_line(),
                generated_column: token.get_dst_col(),
            });
        }
    }
    mappings
        .generated
        .sort_by_key(|token| (token.generated_line, token.generated_column));
    mappings.original.sort_by_key(|token| {
        (
            token.source_line,
            token.source_column,
            token.generated_line,
            token.generated_column,
        )
    });
    Ok(mappings)
}

fn source_matches(source_path: &Path, source: &str) -> bool {
    let expected = source_path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or_default();
    source == source_path.to_string_lossy()
        || source
            .rsplit(['/', '\\'])
            .next()
            .is_some_and(|name| name == expected)
}

#[allow(clippy::too_many_arguments)]
fn compose_source_map(
    source_path: &Path,
    original_text: &str,
    projection_source_map: Option<&str>,
    projection_tokens: &[MappingToken],
    preprocess_mappings: &PreprocessMappings,
    preprocess_status: PreprocessStatus,
    generated_text: &str,
    generated_index: &LineIndex,
    import_insertions: &[(usize, std::ops::Range<usize>)],
) -> Result<Option<String>, TsgoOverlayError> {
    if projection_source_map.is_none() || preprocess_status == PreprocessStatus::Unmapped {
        return Ok(None);
    }

    let mut composed = projection_tokens
        .iter()
        .map(|token| {
            let source = token.source.and_then(|(line, column)| {
                let position = Position::new(line, column);
                match preprocess_status {
                    PreprocessStatus::Identity => Some(position),
                    PreprocessStatus::Mapped => {
                        map_generated_tokens(&preprocess_mappings.generated, position)
                    }
                    PreprocessStatus::Unmapped => None,
                }
            });
            (token.generated_line, token.generated_column, source)
        })
        .collect::<Vec<_>>();
    composed.extend(import_insertions.iter().map(|(_, range)| {
        let position = generated_index.position(generated_text, range.start);
        (position.line, position.character, None)
    }));
    composed.sort_by_key(|(line, column, source)| (*line, *column, source.is_some()));

    let source_name = source_path.to_string_lossy();
    let mut builder = SourceMapBuilder::new(None);
    let source_id = builder.add_source(&source_name);
    builder.set_source_contents(source_id, Some(original_text));
    for (generated_line, generated_column, source) in composed {
        let (source_line, source_column, source_name) = source.map_or((0, 0, None), |position| {
            (
                position.line,
                position.character,
                Some(source_name.as_ref()),
            )
        });
        builder.add(
            generated_line,
            generated_column,
            source_line,
            source_column,
            source_name,
            None,
            false,
        );
    }
    let map = builder.into_sourcemap();
    let mut encoded = Vec::new();
    map.to_writer(&mut encoded)
        .map_err(|error| TsgoOverlayError::InvalidSourceMap {
            path: source_path.to_path_buf(),
            message: error.to_string(),
        })?;
    Ok(Some(
        String::from_utf8(encoded).expect("source-map JSON is UTF-8"),
    ))
}

/// `DocumentSnapshot.ts:232-237` picks `ScriptKind.JS` unless a script tag says
/// TypeScript, and tsgo reads the script kind off the LSP language id rather
/// than off the `.tsx` shadow name.
fn shadow_language_id(source: &str) -> &'static str {
    if is_typescript_component(source) {
        "typescriptreact"
    } else {
        "javascriptreact"
    }
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
            (line == source.line && column <= source.character)
                .then(|| (source.character - column, *token))
        })
        .min_by_key(|(distance, token)| (*distance, token.generated_line, token.generated_column))
        .map(|(_, token)| token)
}

fn map_original_to_preprocessed(entry: &ShadowState, position: Position) -> Option<Position> {
    match entry.preprocess_status {
        PreprocessStatus::Identity => Some(position),
        PreprocessStatus::Mapped => {
            map_original_tokens(&entry.preprocess_mappings.original, position)
        }
        PreprocessStatus::Unmapped => None,
    }
}

fn map_preprocessed_to_original(entry: &ShadowState, position: Position) -> Option<Position> {
    match entry.preprocess_status {
        PreprocessStatus::Identity => Some(position),
        PreprocessStatus::Mapped => {
            map_generated_tokens(&entry.preprocess_mappings.generated, position)
        }
        PreprocessStatus::Unmapped => None,
    }
}

fn map_generated_tokens(tokens: &[MappingToken], position: Position) -> Option<Position> {
    let index = tokens.partition_point(|token| {
        (token.generated_line, token.generated_column) <= (position.line, position.character)
    });
    let previous = index.checked_sub(1).and_then(|index| tokens.get(index))?;
    if previous.generated_line != position.line
        || generated_is_unmapped_gap(tokens, index, position)
    {
        return None;
    }
    previous
        .source
        .map(|(line, column)| Position::new(line, column))
}

fn map_original_tokens(tokens: &[ReverseMappingToken], position: Position) -> Option<Position> {
    let key = (position.line, position.character);
    let first_equal_or_greater =
        tokens.partition_point(|token| (token.source_line, token.source_column) < key);
    let token = tokens
        .get(first_equal_or_greater)
        .filter(|token| (token.source_line, token.source_column) == key)
        .or_else(|| {
            first_equal_or_greater
                .checked_sub(1)
                .and_then(|index| tokens.get(index))
        })?;
    (token.source_line == position.line)
        .then_some(Position::new(token.generated_line, token.generated_column))
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
    use rsvelte_check::overlay::{SHIM_JSX_V4_NAME, SHIM_NATIVE_JSX_NAME, SHIM_SHIMS_V4_NAME};
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

    fn encoded_preprocess_map(
        source_path: &Path,
        original_text: &str,
        mappings: &[(Position, Option<Position>)],
    ) -> String {
        let source_name = source_path.file_name().unwrap().to_string_lossy();
        let mut builder = SourceMapBuilder::new(None);
        let source_id = builder.add_source(&source_name);
        builder.set_source_contents(source_id, Some(original_text));
        let mut mappings = mappings.to_vec();
        mappings.sort_by_key(|(generated, _)| (generated.line, generated.character));
        for (generated, original) in mappings {
            let (line, column, source) = original.map_or((0, 0, None), |original| {
                (
                    original.line,
                    original.character,
                    Some(source_name.as_ref()),
                )
            });
            builder.add(
                generated.line,
                generated.character,
                line,
                column,
                source,
                None,
                false,
            );
        }
        let mut output = Vec::new();
        builder.into_sourcemap().to_writer(&mut output).unwrap();
        String::from_utf8(output).unwrap()
    }

    fn positions_of(text: &str, needle: &str) -> Vec<(Position, Position)> {
        let index = LineIndex::new(text);
        text.match_indices(needle)
            .map(|(offset, value)| {
                (
                    index.position(text, offset),
                    index.position(text, offset + value.len()),
                )
            })
            .collect()
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
        assert!(overlay.cache_dir().join(SHIM_SHIMS_V4_NAME).is_file());
        assert!(overlay.cache_dir().join(SHIM_JSX_V4_NAME).is_file());
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
        assert!(files.contains(&json!(SHIM_SHIMS_V4_NAME)));
        assert!(files.contains(&json!(SHIM_JSX_V4_NAME)));
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

    fn overlay_config_of(workspace: &Path) -> serde_json::Value {
        let overlay = TsgoOverlay::build(workspace, None).unwrap();
        serde_json::from_str(&fs::read_to_string(overlay.tsconfig_path()).unwrap()).unwrap()
    }

    #[test]
    fn a_project_without_a_config_does_not_pull_in_the_whole_workspace() {
        let workspace = TestWorkspace::new("no-config-include");
        write(&workspace.0.join("src/App.svelte"), "<p />");
        write(
            &workspace.0.join("src/globals.d.ts"),
            "declare const unrelated: 1;",
        );

        let config = overlay_config_of(&workspace.0);
        // `service.ts:874-878` builds its fallback with `include: []`.
        assert_eq!(config["include"], json!(["svelte/**/*"]));
        assert_eq!(config["compilerOptions"]["target"], json!("ESNext"));
        assert!(config.get("extends").is_none());
    }

    #[test]
    fn a_target_below_es2015_is_raised_and_a_modern_one_is_left_alone() {
        for (declared, expected) in [
            ("ES5", Some("ES2015")),
            ("es3", Some("ES2015")),
            ("ES2020", None),
            ("ESNext", None),
        ] {
            let workspace = TestWorkspace::new(&format!("target-{declared}"));
            write(
                &workspace.0.join("tsconfig.json"),
                &format!("{{ \"compilerOptions\": {{ \"target\": \"{declared}\" }} }}"),
            );
            write(&workspace.0.join("App.svelte"), "<p />");

            let config = overlay_config_of(&workspace.0);
            assert_eq!(
                config["compilerOptions"]
                    .get("target")
                    .and_then(|v| v.as_str()),
                expected,
                "declared {declared}"
            );
        }
    }

    #[test]
    fn a_target_is_read_through_the_extends_chain() {
        let workspace = TestWorkspace::new("target-extends");
        write(
            &workspace.0.join("configs/base.json"),
            r#"{ "compilerOptions": { "target": "ES2022" } }"#,
        );
        write(
            &workspace.0.join("tsconfig.json"),
            r#"{ "extends": "./configs/base.json" }"#,
        );
        write(&workspace.0.join("App.svelte"), "<p />");

        assert!(
            overlay_config_of(&workspace.0)["compilerOptions"]
                .get("target")
                .is_none()
        );
    }

    #[test]
    fn the_native_jsx_shim_is_part_of_every_program() {
        let workspace = TestWorkspace::new("native-jsx-shim");
        write(&workspace.0.join("App.svelte"), "<p />");

        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        assert!(overlay.cache_dir().join(SHIM_NATIVE_JSX_NAME).is_file());
        let config: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(overlay.tsconfig_path()).unwrap()).unwrap();
        assert!(
            config["files"]
                .as_array()
                .unwrap()
                .contains(&json!(SHIM_NATIVE_JSX_NAME))
        );
    }

    #[test]
    fn the_jsx_shim_is_a_fallback_for_a_package_without_svelte_html() {
        // `get_global_types` pushes `svelte-jsx-v4.d.ts` only when the
        // installed svelte has no `svelte-html.d.ts`; shipping both would put
        // two `svelteHTML` namespaces in one program.
        let workspace = TestWorkspace::new("jsx-shim-fallback");
        let svelte = workspace.0.join("node_modules").join("svelte");
        write(&svelte.join("package.json"), r#"{"version":"5.0.0"}"#);

        let (without, html) = global_type_files(&workspace.0);
        assert_eq!(html, None);
        assert!(without.contains(&SHIM_JSX_V4_NAME));

        write(&svelte.join("svelte-html.d.ts"), "");
        let (with, html) = global_type_files(&workspace.0);
        assert!(html.is_some_and(|path| path.ends_with("svelte/svelte-html.d.ts")));
        assert!(!with.contains(&SHIM_JSX_V4_NAME));
        assert!(with.contains(&SHIM_SHIMS_V4_NAME) && with.contains(&SHIM_NATIVE_JSX_NAME));
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
    fn preprocessing_composes_original_preprocessed_and_tsx_positions() {
        let workspace = TestWorkspace::new("preprocess-compose");
        let app = workspace.0.join("src/App.svelte");
        let original = concat!(
            "<script lang=\"ts\">\r\n",
            "const emoji = \"😀\"; let value = 1;\r\n",
            "</script>\r\n",
            "<p>{value}</p>\r\n"
        );
        let preprocessed = format!("<!-- generated -->\n{original}");
        write(&app, original);
        let original_values = positions_of(original, "value");
        let preprocessed_values = positions_of(&preprocessed, "value");
        let mappings = preprocessed_values
            .iter()
            .zip(&original_values)
            .flat_map(
                |(&(generated_start, generated_end), &(source_start, source_end))| {
                    [
                        (generated_start, Some(source_start)),
                        (generated_end, Some(source_end)),
                    ]
                },
            )
            .collect::<Vec<_>>();
        let preprocess_map = encoded_preprocess_map(&app, original, &mappings);
        let mut overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let shadow = overlay
            .open_or_update_preprocessed(&app, original, &preprocessed, Some(&preprocess_map), 4)
            .unwrap();
        let shadow_path = overlay.shadow_dir.join("src/App.svelte.tsx");

        assert_eq!(
            overlay.preprocess_status(&app),
            Some(PreprocessStatus::Mapped)
        );
        assert_eq!(overlay.preprocessed_text(&app), Some(preprocessed.as_str()));
        assert_eq!(overlay.preprocess_map(&app), Some(preprocess_map.as_str()));
        assert!(overlay.projection_map(&app).unwrap().segments().is_empty());

        let source_start = original_values[0].0;
        let source_offset = original.find("value").unwrap();
        let line_start = original[..source_offset].rfind('\n').map_or(0, |at| at + 1);
        assert_eq!(
            u32::try_from(source_offset - line_start).unwrap(),
            source_start.character + 2,
            "the source position must count the astral character as two UTF-16 units"
        );
        let generated_start = overlay
            .map_source_position(&app, source_start)
            .expect("original position maps through preprocessing and TSX");
        assert_eq!(
            overlay.map_generated_position(&shadow_path, generated_start),
            Some(source_start)
        );

        let source_range = Range::new(original_values[0].0, original_values[1].1);
        let generated_range = overlay
            .map_source_range(&app, source_range)
            .expect("multiline range maps through all layers");
        assert_eq!(
            overlay.map_generated_range(&shadow_path, generated_range),
            Some(source_range)
        );

        let generated_offset = utf8_offset(&shadow.text, generated_start);
        let generated_utf16 = LineIndex::new(&shadow.text).position(&shadow.text, generated_offset);
        let composed = SourceMap::from_slice(overlay.source_map(&app).unwrap().as_bytes()).unwrap();
        let token = composed
            .lookup_token(generated_utf16.line, generated_utf16.character)
            .unwrap();
        assert_eq!(token.get_src(), (source_start.line, source_start.character));
    }

    #[test]
    fn preprocessing_rejects_removed_and_generated_only_positions() {
        let workspace = TestWorkspace::new("preprocess-unmapped");
        let app = workspace.0.join("App.svelte");
        let original = "<script>\nlet kept = 1;\nlet removed = 2;\n</script>\n";
        let preprocessed = "<script>\nlet kept = 1;\nlet injected = 3;\n</script>\n";
        write(&app, original);
        let original_kept = positions_of(original, "kept")[0].0;
        let preprocessed_kept = positions_of(preprocessed, "kept")[0].0;
        let original_end = Position::new(3, 0);
        let preprocessed_end = Position::new(3, 0);
        let injected = positions_of(preprocessed, "injected")[0].0;
        let preprocess_map = encoded_preprocess_map(
            &app,
            original,
            &[
                (preprocessed_kept, Some(original_kept)),
                (injected, None),
                (preprocessed_end, Some(original_end)),
            ],
        );
        let mut overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let shadow = overlay
            .open_or_update_preprocessed(&app, original, preprocessed, Some(&preprocess_map), 1)
            .unwrap();
        let shadow_path = overlay.shadow_dir.join("App.svelte.tsx");

        let removed = positions_of(original, "removed")[0].0;
        assert_eq!(overlay.map_source_position(&app, removed), None);
        let generated_injected = shadow.text.find("injected").unwrap();
        assert_eq!(
            overlay.map_generated_position(
                &shadow_path,
                utf8_position(&shadow.text, generated_injected)
            ),
            None
        );

        overlay
            .open_or_update_preprocessed(&app, original, preprocessed, None, 2)
            .unwrap();
        assert_eq!(
            overlay.preprocess_status(&app),
            Some(PreprocessStatus::Unmapped)
        );
        assert_eq!(overlay.source_map(&app), None);
        assert_eq!(overlay.map_source_position(&app, original_kept), None);
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

    #[test]
    fn a_component_without_a_typescript_script_opens_as_javascript() {
        // tsgo decides the script kind from the language id, not from the
        // `.tsx` shadow name, so this is what keeps TypeScript-only keywords
        // out of a plain component's completions.
        assert_eq!(
            shadow_language_id("<script>let a = 1;</script>"),
            "javascriptreact"
        );
        assert_eq!(shadow_language_id("<div>{a}</div>"), "javascriptreact");
        assert_eq!(
            shadow_language_id("<script lang=\"ts\">let a: number = 1;</script>"),
            "typescriptreact"
        );
        assert_eq!(
            shadow_language_id("<script module lang=\"ts\">export const a = 1;</script>"),
            "typescriptreact"
        );
    }
}
