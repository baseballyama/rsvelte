//! `rsvelte_lint_types` — the type-aware lint backend.
//!
//! Implements [`rsvelte_lint::type_backend::TypeBackend`] over a warm
//! `corsa::ProjectSession` driving a `typescript-go` (`tsgo`) worker, following
//! the proven `vize_patina` `corsa_session` driver. It:
//!
//! 1. runs [`rsvelte_projection::svelte2tsx`] to lower the component to TSX (carrying
//!    a forward-mapping table for verbatim regions),
//! 2. appends a universal probe anchor
//!    (`ReturnType<typeof $$render>["props"]`) so the fully-resolved props type
//!    can be queried without knowing the user's type name,
//! 3. opens the generated TSX as a virtual document in a [`CorsaTypeSession`]
//!    (one worker process, reused across components), and
//! 4. answers [`TypeBackend::probe_props`] / [`TypeBackend::probe_expr`] via
//!    `get_type_at_position` probes (byte→UTF-16 converted).
//!
//! See the crate `Cargo.toml` header for why this lives outside the main
//! workspace.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::rc::Rc;

use corsa_client::api::{
    ApiClient, ApiMode, ApiSpawnConfig, ProjectSession, TypeHandle, TypeProbeOptions,
};
use corsa_runtime::block_on;
use rsvelte_lint::type_backend::{PropMeta, TypeBackend, TypeFacts, TypeId, TypeMeta};
use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

mod resolver;
pub use resolver::{MISSING_TSGO_HELP, require_tsgo, resolve_tsgo};

use rsvelte_diagnostics::Diagnostic;

/// Lint a Svelte component with the **type-aware** rules.
///
/// Uses a real `tsgo` checker spawned via [`CorsaTypeBackend`]. Runs every
/// rule that has a type-aware path (`svelte/no-unused-props` and
/// `svelte/no-navigation-without-resolve`) and returns their diagnostics.
///
/// This is the type-aware layer; a consumer merges it with the syntactic lint
/// (with those two rules disabled there, so each fires once). Returns `Err` if
/// the checker session cannot be started.
///
/// # Errors
///
/// Returns an error when the type-checker session cannot be started.
pub fn lint_component_types(
    source: &str,
    svelte_path: &std::path::Path,
    config: &rsvelte_lint::config::LintConfig,
    tsgo: &Path,
) -> Result<Vec<Diagnostic>, String> {
    use rsvelte_lint::rules::{no_navigation_without_resolve, no_unused_props};

    let mut backend = CorsaTypeBackend::new(source, svelte_path, tsgo)?;
    let mut out = no_unused_props::diagnostics_typed(source, svelte_path, config, &mut backend);
    out.extend(no_navigation_without_resolve::diagnostics_typed(
        source,
        svelte_path,
        config,
        &mut backend,
    ));
    Ok(out)
}

/// Lint several components with the **type-aware** rules on ONE warm worker.
///
/// The per-component entry point spawns a `tsgo` worker each time, which costs
/// more than every probe it then answers; this opens the worker once.
///
/// # Errors
///
/// Returns an error when the worker cannot be started. A component whose own
/// projection or project open fails is reported with no diagnostics rather
/// than failing the batch.
pub fn lint_components_types(
    components: &[(PathBuf, String)],
    config: &rsvelte_lint::config::LintConfig,
    tsgo: &Path,
    project_root: &Path,
) -> Result<Vec<(PathBuf, Vec<Diagnostic>)>, String> {
    use rsvelte_lint::rules::{no_navigation_without_resolve, no_unused_props};

    if components.is_empty() {
        return Ok(Vec::new());
    }
    let session = CorsaTypeSession::new(tsgo, project_root)?;

    // Lower every component before the program is opened: the tsconfig has to
    // name all of them at once, so a component added later would need a second
    // program.
    let projected: Vec<Option<Projected>> = components
        .iter()
        .map(|(path, source)| Projected::write(source, path).ok())
        .collect();
    let _files: Vec<VirtualFileGuard> = projected
        .iter()
        .flatten()
        .map(|p| VirtualFileGuard(p.virtual_path.clone()))
        .collect();

    let virtual_paths: Vec<String> = projected
        .iter()
        .flatten()
        .map(|p| json_string(&p.virtual_path.to_string_lossy()))
        .collect();
    if virtual_paths.is_empty() {
        return Ok(components
            .iter()
            .map(|(path, _)| (path.clone(), Vec::new()))
            .collect());
    }
    let tsconfig_path = project_root.join(format!(
        ".rsvelte-lint.{}.tsconfig.json",
        std::process::id()
    ));
    let tsconfig = TSCONFIG.replace(
        "\"jsx\": \"preserve\"\n  }",
        &format!(
            "\"jsx\": \"preserve\"\n  }},\n  \"files\": [{}]",
            virtual_paths.join(",")
        ),
    );
    std::fs::write(&tsconfig_path, tsconfig)
        .map_err(|e| format!("failed to write tsconfig {}: {e}", tsconfig_path.display()))?;
    let tsconfig_guard = VirtualFileGuard(tsconfig_path.clone());

    let first = projected
        .iter()
        .flatten()
        .next()
        .map(|p| p.virtual_path.to_string_lossy().into_owned());
    let project = Rc::new(
        block_on(ProjectSession::open(
            session.client.clone(),
            tsconfig_path.to_string_lossy().into_owned(),
            first.map(Into::into),
        ))
        .map_err(|e| format!("failed to open corsa project: {e}"))?,
    );
    drop(tsconfig_guard);

    let mut out = Vec::with_capacity(components.len());
    for ((path, source), p) in components.iter().zip(projected) {
        let Some(p) = p else {
            out.push((path.clone(), Vec::new()));
            continue;
        };
        let mut backend = CorsaTypeBackend::view(Rc::clone(&project), p);
        let mut diags = no_unused_props::diagnostics_typed(source, path, config, &mut backend);
        diags.extend(no_navigation_without_resolve::diagnostics_typed(
            source,
            path,
            config,
            &mut backend,
        ));
        out.push((path.clone(), diags));
    }
    Ok(out)
}

/// The text appended to the generated TSX. `$$render` is the render function
/// svelte2tsx always emits; `ReturnType<...>["props"]` is the fully-resolved
/// props type (extends / intersection / generics / imports all expanded),
/// independent of the user's type name. The trailing identifier is an
/// expression of that type — a probe target.
const PROPS_ANCHOR: &str = "\n;const __rsvelte_props_probe: ReturnType<typeof $$render>[\"props\"] = null as any; __rsvelte_props_probe;\n";
/// The identifier inside [`PROPS_ANCHOR`] whose type we probe.
const PROPS_ANCHOR_IDENT: &str = "__rsvelte_props_probe;";

const TSCONFIG: &str = r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "preserve"
  }
}
"#;

/// TypeScript `ObjectFlags.Class` (`1 << 0`) — set on class *instance* types.
const OBJECT_FLAGS_CLASS: u32 = 1;

/// An interned type: its `corsa` handle (absent when unresolved) and the
/// `ObjectFlags` bitset captured when it was first seen.
struct TypeSlot {
    handle: Option<TypeHandle>,
    object_flags: u32,
}

/// The memoized state of the optional props type.
#[derive(Clone, Copy)]
enum PropsTypeCache {
    Uncomputed,
    Missing,
    Present(TypeId),
}

/// One component lowered to TSX and written beside its source, so relative
/// imports (`./types`) resolve exactly as they do for the real file.
struct Projected {
    tsx: String,
    forward_map: Vec<(u32, u32, u32)>,
    props_anchor: Option<u32>,
    virtual_path: PathBuf,
}

impl Projected {
    fn write(source: &str, svelte_path: &Path) -> Result<Self, String> {
        let filename = svelte_path.file_name().map_or_else(
            || "Component.svelte".to_string(),
            |n| n.to_string_lossy().into_owned(),
        );
        let result = svelte2tsx(
            source,
            Svelte2TsxOptions {
                filename,
                is_ts_file: true,
                ..Default::default()
            },
        )
        .map_err(|e| format!("svelte2tsx failed: {e:?}"))?;

        let mut tsx = result.code;
        // Inject the props anchor only when a render function exists to index.
        let props_anchor = if tsx.contains("function $$render") {
            tsx.push_str(PROPS_ANCHOR);
            tsx.rfind(PROPS_ANCHOR_IDENT)
                .and_then(|p| u32::try_from(p).ok())
        } else {
            None
        };

        let dir = svelte_path
            .parent()
            .map_or_else(|| PathBuf::from("."), Path::to_path_buf);
        let stem = svelte_path.file_stem().map_or_else(
            || "Component".to_string(),
            |s| s.to_string_lossy().into_owned(),
        );
        let virtual_path = dir.join(format!("{stem}.{}.rsvelte-lint.tsx", std::process::id()));
        std::fs::write(&virtual_path, &tsx).map_err(|e| {
            format!(
                "failed to write virtual TSX {}: {e}",
                virtual_path.display()
            )
        })?;

        Ok(Self {
            tsx,
            forward_map: result.forward_map,
            props_anchor,
            virtual_path,
        })
    }
}

/// A warm `tsgo` worker shared by every component of one lint run.
///
/// Spawning the worker and loading its libs costs far more than the probes it
/// answers, so the process is opened once and each component only opens a
/// project on top of it.
pub struct CorsaTypeSession {
    client: ApiClient,
    closed: bool,
}

impl CorsaTypeSession {
    /// Spawn the worker for `tsgo`, resolving relative paths against `cwd`.
    ///
    /// # Errors
    ///
    /// Returns an error when the worker cannot be spawned.
    pub fn new(tsgo: &Path, cwd: &Path) -> Result<Self, String> {
        let client = block_on(ApiClient::spawn(
            ApiSpawnConfig::new(tsgo)
                .with_mode(api_mode_for(tsgo))
                .with_cwd(cwd),
        ))
        .map_err(|e| format!("failed to spawn corsa worker: {e}"))?;
        Ok(Self {
            client,
            closed: false,
        })
    }

    /// Open `source` (the `.svelte` file at `svelte_path`) on this worker.
    ///
    /// # Errors
    ///
    /// Returns an error when projection, virtual-file setup, or opening the
    /// project fails.
    pub fn backend(&self, source: &str, svelte_path: &Path) -> Result<CorsaTypeBackend, String> {
        CorsaTypeBackend::open(self.client.clone(), None, source, svelte_path)
    }

    /// Shut the worker down. Idempotent.
    pub fn close(&mut self) {
        if self.closed {
            return;
        }
        self.closed = true;
        let _ = block_on(self.client.close());
    }
}

impl Drop for CorsaTypeSession {
    fn drop(&mut self) {
        self.close();
    }
}

/// A corsa/tsgo-backed [`TypeBackend`] for a single Svelte component.
pub struct CorsaTypeBackend {
    /// Kept alive only when this backend spawned its own worker
    /// ([`CorsaTypeBackend::new`]); `None` when the worker is shared.
    owned_worker: Option<CorsaTypeSession>,
    /// Shared with every sibling component when one program covers them all.
    session: Rc<ProjectSession>,
    /// Whether dropping this backend should unlink the virtual TSX. False when
    /// a batch owns the file for the lifetime of the shared program.
    owns_virtual_file: bool,
    /// The generated TSX (with the props anchor appended) — kept for byte→UTF-16
    /// conversion at probe time.
    tsx: String,
    /// Forward-mapping segments from the original Svelte source to the generated
    /// TSX (verbatim regions only).
    forward_map: Vec<(u32, u32, u32)>,
    /// Byte offset (in [`Self::tsx`]) of the props-anchor probe identifier, if
    /// the anchor was injected.
    props_anchor: Option<u32>,
    /// Wire path string of the virtual document.
    virtual_wire: String,
    /// On-disk path of the virtual document (removed on drop).
    virtual_path: PathBuf,
    closed: bool,
    /// Interned `corsa` types, indexed by [`TypeId`]. A `None` handle is a type
    /// that could not be resolved (yields no metadata).
    types: Vec<TypeSlot>,
    /// Dedup map: handle string → [`TypeId`].
    type_index: HashMap<String, TypeId>,
    /// Memoized result of [`Self::props_type`].
    props_type_cache: PropsTypeCache,
}

impl CorsaTypeBackend {
    /// Create a backend for `source` (the `.svelte` file at `svelte_path`),
    /// spawning a worker for the `tsgo` binary at `tsgo` and owning it. Prefer
    /// [`CorsaTypeSession::backend`] when more than one component is checked.
    ///
    /// # Errors
    ///
    /// Returns an error when projection, virtual-file setup, or the checker
    /// session initialization fails.
    pub fn new(source: &str, svelte_path: &Path, tsgo: &Path) -> Result<Self, String> {
        let cwd = svelte_path
            .parent()
            .map_or_else(|| PathBuf::from("."), Path::to_path_buf);
        let worker = CorsaTypeSession::new(tsgo, &cwd)?;
        Self::open(worker.client.clone(), Some(worker), source, svelte_path)
    }

    /// Open a component on an already-spawned worker. The virtual TSX document
    /// is written beside `svelte_path` so relative imports (`./types`) resolve.
    fn open(
        client: ApiClient,
        owned_worker: Option<CorsaTypeSession>,
        source: &str,
        svelte_path: &Path,
    ) -> Result<Self, String> {
        let projected = Projected::write(source, svelte_path)?;
        let Projected {
            tsx,
            forward_map,
            props_anchor,
            virtual_path,
        } = projected;
        let project_root = svelte_path
            .parent()
            .map_or_else(|| PathBuf::from("."), Path::to_path_buf);
        let cleanup = VirtualFileGuard(virtual_path.clone());

        // tsconfig listing the absolute virtual file (kept beside the source so
        // module resolution mirrors the real project).
        let tsconfig_path = project_root.join(format!(
            ".rsvelte-lint.{}.tsconfig.json",
            std::process::id()
        ));
        let tsconfig = TSCONFIG.replace(
            "\"jsx\": \"preserve\"\n  }",
            &format!(
                "\"jsx\": \"preserve\"\n  }},\n  \"files\": [{}]",
                json_string(&virtual_path.to_string_lossy())
            ),
        );
        std::fs::write(&tsconfig_path, tsconfig)
            .map_err(|e| format!("failed to write tsconfig {}: {e}", tsconfig_path.display()))?;
        let tsconfig_guard = VirtualFileGuard(tsconfig_path.clone());

        let virtual_wire = virtual_path.to_string_lossy().into_owned();
        let session = block_on(ProjectSession::open(
            client,
            tsconfig_path.to_string_lossy().into_owned(),
            Some(virtual_wire.clone().into()),
        ))
        .map_err(|e| format!("failed to open corsa project: {e}"))?;

        // The tsconfig only needs to exist for the initial program load.
        drop(tsconfig_guard);
        let virtual_path = cleanup.0.clone();
        std::mem::forget(cleanup); // ownership transferred to the struct's Drop

        Ok(Self {
            owned_worker,
            session: Rc::new(session),
            owns_virtual_file: true,
            tsx,
            forward_map,
            props_anchor,
            virtual_wire,
            virtual_path,
            closed: false,
            types: Vec::new(),
            type_index: HashMap::new(),
            props_type_cache: PropsTypeCache::Uncomputed,
        })
    }

    /// A component view onto a program that already contains its virtual TSX.
    /// The batch owns the file, so dropping this view must not unlink it.
    fn view(session: Rc<ProjectSession>, projected: Projected) -> Self {
        let virtual_wire = projected.virtual_path.to_string_lossy().into_owned();
        Self {
            owned_worker: None,
            session,
            owns_virtual_file: false,
            tsx: projected.tsx,
            forward_map: projected.forward_map,
            props_anchor: projected.props_anchor,
            virtual_wire,
            virtual_path: projected.virtual_path,
            closed: false,
            types: Vec::new(),
            type_index: HashMap::new(),
            props_type_cache: PropsTypeCache::Uncomputed,
        }
    }

    /// Intern a type (handle + `ObjectFlags`) into a stable [`TypeId`], deduping
    /// by handle string. `None` handle ⇒ an unresolved type.
    fn intern(&mut self, handle: Option<&TypeHandle>, object_flags: u32) -> TypeId {
        if let Some(h) = handle {
            if let Some(&id) = self.type_index.get(h.as_str()) {
                return id;
            }
            let id = TypeId::try_from(self.types.len())
                .expect("type table exceeds the u32 TypeId domain");
            self.type_index.insert(h.as_str().to_string(), id);
            self.types.push(TypeSlot {
                handle: Some(h.clone()),
                object_flags,
            });
            id
        } else {
            let id = TypeId::try_from(self.types.len())
                .expect("type table exceeds the u32 TypeId domain");
            self.types.push(TypeSlot {
                handle: None,
                object_flags,
            });
            id
        }
    }

    fn handle_of(&self, id: TypeId) -> Option<TypeHandle> {
        self.types
            .get(usize::try_from(id).expect("TypeId fits the platform usize"))
            .and_then(|s| s.handle.clone())
    }

    fn object_flags_of(&self, id: TypeId) -> u32 {
        self.types
            .get(usize::try_from(id).expect("TypeId fits the platform usize"))
            .map_or(0, |s| s.object_flags)
    }

    /// Resolve the props type handle from the injected anchor.
    fn compute_props_type(&mut self) -> Option<TypeId> {
        let offset = self.props_anchor?;
        let utf16 = byte_to_utf16(&self.tsx, offset);
        let file = self.virtual_wire.clone();
        let resp = if let Some(sym) =
            block_on(self.session.get_symbol_at_position(file.clone(), utf16))
                .ok()
                .flatten()
        {
            block_on(self.session.get_type_of_symbol(sym.id))
                .ok()
                .flatten()
                .map(|t| (t.id, t.object_flags.unwrap_or(0)))
        } else {
            None
        };
        let resp = resp.or_else(|| {
            block_on(self.session.get_type_at_position(file, utf16))
                .ok()
                .flatten()
                .map(|t| (t.id, t.object_flags.unwrap_or(0)))
        });
        let (handle, flags) = resp?;
        Some(self.intern(Some(&handle), flags))
    }

    fn probe(&self, generated_offset: u32, load_property_types: bool) -> Option<TypeFacts> {
        let utf16 = byte_to_utf16(&self.tsx, generated_offset);
        let probe = block_on(self.session.probe_type_at_position(
            self.virtual_wire.clone(),
            utf16,
            TypeProbeOptions {
                load_property_types,
                load_signatures: false,
            },
        ))
        .ok()??;
        Some(TypeFacts {
            type_texts: probe.type_texts.iter().map(ToString::to_string).collect(),
            property_names: probe
                .property_names
                .iter()
                .map(ToString::to_string)
                .collect(),
            property_types: probe
                .property_types
                .iter()
                .map(|ts| ts.iter().map(ToString::to_string).collect())
                .collect(),
        })
    }

    fn close(&mut self) {
        if self.closed {
            return;
        }
        self.closed = true;
        if self.owns_virtual_file {
            let _ = std::fs::remove_file(&self.virtual_path);
        }
        if let Some(worker) = self.owned_worker.as_mut() {
            worker.close();
        }
    }
}

impl TypeBackend for CorsaTypeBackend {
    fn probe_props(&mut self) -> Option<TypeFacts> {
        let offset = self.props_anchor?;
        let facts = self.probe(offset, true)?;
        // An empty / `Record<string, never>` props type means no declared props.
        if facts.property_names.is_empty() {
            return None;
        }
        Some(facts)
    }

    fn probe_expr(&mut self, svelte_offset: u32) -> Option<TypeFacts> {
        let generated = map_offset_forward(&self.forward_map, svelte_offset)?;
        self.probe(generated, false)
    }

    fn props_type(&mut self) -> Option<TypeId> {
        match self.props_type_cache {
            PropsTypeCache::Present(type_id) => return Some(type_id),
            PropsTypeCache::Missing => return None,
            PropsTypeCache::Uncomputed => {}
        }
        let computed = self.compute_props_type();
        self.props_type_cache = computed.map_or(PropsTypeCache::Missing, PropsTypeCache::Present);
        computed
    }

    fn type_meta(&mut self, t: TypeId) -> Option<TypeMeta> {
        let handle = self.handle_of(t)?;
        let text =
            block_on(self.session.type_to_string(handle.clone(), None, None)).unwrap_or_default();
        let snap = self.session.snapshot().handle.clone();
        let proj = self.session.project_handle();
        let has_index_signature = block_on(self.session.client().get_index_infos_of_type(
            snap.clone(),
            proj.clone(),
            handle.clone(),
        ))
        .is_ok_and(|infos| {
            infos
                .iter()
                .any(|i| !type_texts_are_any(&i.value_type.texts))
        });
        let bases =
            block_on(self.session.client().get_base_types(snap, proj, handle)).unwrap_or_default();
        let base_type_ids = bases
            .into_iter()
            .map(|t| self.intern(Some(&t.id), t.object_flags.unwrap_or(0)))
            .collect();
        Some(TypeMeta {
            text,
            has_index_signature,
            is_class: self.object_flags_of(t) & OBJECT_FLAGS_CLASS != 0,
            base_type_ids,
        })
    }

    fn type_props(&mut self, t: TypeId) -> Vec<PropMeta> {
        let Some(handle) = self.handle_of(t) else {
            return Vec::new();
        };
        let props = block_on(self.session.get_properties_of_type(handle)).unwrap_or_default();
        let mut out = Vec::with_capacity(props.len());
        for sym in props {
            let decl_paths: Vec<String> = sym
                .declarations
                .iter()
                .filter_map(|d| node_handle_path(d.as_str()))
                .collect();
            let is_local = !decl_paths.is_empty()
                && decl_paths.iter().all(|p| same_file(p, &self.virtual_wire));
            let is_builtin = decl_paths.first().is_some_and(|p| is_lib_path(p));
            let ptype = block_on(self.session.get_type_of_symbol(sym.id))
                .ok()
                .flatten();
            let type_id = self.intern(
                ptype.as_ref().map(|t| &t.id),
                ptype.as_ref().and_then(|t| t.object_flags).unwrap_or(0),
            );
            out.push(PropMeta {
                name: sym.name.as_str().to_string(),
                is_local,
                is_builtin,
                type_id,
            });
        }
        out
    }
}

/// Whether rendered type texts denote `any` (so an index signature with this
/// value type is "any-typed" and ignored, mirroring upstream `isAnyType`).
fn type_texts_are_any(texts: &[impl AsRef<str>]) -> bool {
    !texts.is_empty() && texts.iter().all(|t| t.as_ref() == "any")
}

/// Extract the source-file path from a `corsa` [`NodeHandle`] string. The wire
/// form is `<pos>.<kind>.<path>` (numeric components then the path, which begins
/// at the first non-numeric/non-`.` character — i.e. the leading `/` of an
/// absolute path). `NodeHandle::parse()` assumes a 3-number layout that the
/// current worker doesn't emit, so we strip the numeric prefix directly.
fn node_handle_path(h: &str) -> Option<String> {
    let path = h.trim_start_matches(|c: char| c.is_ascii_digit() || c == '.');
    (!path.is_empty()).then(|| path.to_string())
}

/// Compare two file paths for `isInternalProperty`. The worker lowercases paths
/// (and macOS is case-insensitive), so compare case-insensitively.
const fn same_file(a: &str, b: &str) -> bool {
    a.eq_ignore_ascii_case(b)
}

/// Heuristic for `isBuiltInProperty`: a property declared in TypeScript's
/// bundled lib (`lib.*.d.ts`) or the `typescript`/native-preview lib dir.
fn is_lib_path(p: &str) -> bool {
    p.contains("node_modules/typescript/lib/")
        || p.contains("native-preview")
        || (p.contains("/lib.") && p.ends_with(".d.ts"))
}

impl Drop for CorsaTypeBackend {
    fn drop(&mut self) {
        self.close();
    }
}

/// Mirrors `vize_patina`'s `api_mode_for_executable`: native binaries speak
/// msgpack; Node wrappers (`.js`, `.bin/…`, `native-preview/bin/…`) speak
/// JSON-RPC.
fn api_mode_for(path: &Path) -> ApiMode {
    if path.extension().and_then(|e| e.to_str()) == Some("js") {
        return ApiMode::AsyncJsonRpcStdio;
    }
    if path
        .parent()
        .and_then(|p| p.file_name())
        .and_then(|n| n.to_str())
        == Some(".bin")
    {
        return ApiMode::AsyncJsonRpcStdio;
    }
    let parent = path.parent();
    let grandparent = parent.and_then(Path::parent);
    if parent.and_then(|p| p.file_name()).and_then(|n| n.to_str()) == Some("bin")
        && grandparent
            .and_then(|p| p.file_name())
            .and_then(|n| n.to_str())
            == Some("native-preview")
    {
        return ApiMode::AsyncJsonRpcStdio;
    }
    ApiMode::SyncMsgpackStdio
}

/// Forward-map an original Svelte byte offset to a generated TSX byte offset.
fn map_offset_forward(segments: &[(u32, u32, u32)], offset: u32) -> Option<u32> {
    for &(o_start, o_end, g_start) in segments {
        if offset >= o_start && offset < o_end {
            return Some(g_start + (offset - o_start));
        }
    }
    None
}

/// Convert a UTF-8 byte offset into `source` to a UTF-16 code-unit offset (the
/// unit corsa/`tsgo` positions use).
fn byte_to_utf16(source: &str, byte_offset: u32) -> u32 {
    let mut clamped = usize::try_from(byte_offset)
        .expect("u32 byte offset fits the platform usize")
        .min(source.len());
    while clamped > 0 && !source.is_char_boundary(clamped) {
        clamped -= 1;
    }
    u32::try_from(source[..clamped].encode_utf16().count())
        .expect("UTF-16 offset fits the protocol's u32 position domain")
}

fn json_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            _ => out.push(c),
        }
    }
    out.push('"');
    out
}

/// Removes a temp file on drop (used until ownership is transferred / dropped).
struct VirtualFileGuard(PathBuf);
impl Drop for VirtualFileGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.0);
    }
}
