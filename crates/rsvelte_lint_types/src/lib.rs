//! `rsvelte_lint_types` — the type-aware lint backend.
//!
//! Implements [`rsvelte_lint::type_backend::TypeBackend`] over a warm
//! `corsa::ProjectSession` driving a `typescript-go` (`tsgo`) worker, following
//! the proven `vize_patina` `corsa_session` driver. It:
//!
//! 1. runs [`rsvelte_core::svelte2tsx`] to lower the component to TSX (carrying
//!    a forward-mapping table for verbatim regions),
//! 2. appends a universal probe anchor
//!    (`ReturnType<typeof $$render>["props"]`) so the fully-resolved props type
//!    can be queried without knowing the user's type name,
//! 3. opens the generated TSX as the session's virtual document, and
//! 4. answers [`TypeBackend::probe_props`] / [`TypeBackend::probe_expr`] via
//!    `get_type_at_position` probes (byte→UTF-16 converted).
//!
//! See the crate `Cargo.toml` header for why this lives outside the main
//! workspace.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use corsa_client::api::{
    ApiMode, ApiSpawnConfig, FileChangeSummary, FileChanges, ProjectSession, TypeHandle,
    TypeProbeOptions,
};
use corsa_runtime::block_on;
use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use rsvelte_lint::type_backend::{PropMeta, TypeBackend, TypeFacts, TypeId, TypeMeta};

mod resolver;
pub use resolver::resolve_tsgo;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;

/// Lint a single Svelte component with the **type-aware** rules, using a real
/// `tsgo` checker spawned via [`CorsaTypeBackend`]. Runs every rule that has a
/// type-aware path (`svelte/no-unused-props`, `svelte/no-navigation-without-resolve`)
/// and returns their diagnostics.
///
/// This is the type-aware layer; a consumer merges it with the syntactic lint
/// (with those two rules disabled there, so each fires once). Returns `Err` if
/// the checker session cannot be started.
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

/// A corsa/tsgo-backed [`TypeBackend`] for a single Svelte component.
pub struct CorsaTypeBackend {
    session: ProjectSession,
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
    props_type_cache: Option<Option<TypeId>>,
}

impl CorsaTypeBackend {
    /// Create a backend for `source` (the `.svelte` file at `svelte_path`),
    /// driving the `tsgo` binary at `tsgo`. The virtual TSX document is written
    /// beside `svelte_path` so relative imports (`./types`) resolve.
    pub fn new(source: &str, svelte_path: &Path, tsgo: &Path) -> Result<Self, String> {
        let filename = svelte_path
            .file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "Component.svelte".to_string());
        let result = svelte2tsx(
            source,
            Svelte2TsxOptions {
                filename: filename.clone(),
                is_ts_file: true,
                ..Default::default()
            },
        )
        .map_err(|e| format!("svelte2tsx failed: {e:?}"))?;

        let mut tsx = result.code;
        // Inject the props anchor only when a render function exists to index.
        let props_anchor = if tsx.contains("function $$render") {
            tsx.push_str(PROPS_ANCHOR);
            tsx.rfind(PROPS_ANCHOR_IDENT).map(|p| p as u32)
        } else {
            None
        };

        let project_root = svelte_path
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| PathBuf::from("."));
        let stem = svelte_path
            .file_stem()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_else(|| "Component".to_string());
        let virtual_path =
            project_root.join(format!("{stem}.{}.rsvelte-lint.tsx", std::process::id()));
        std::fs::write(&virtual_path, &tsx)
            .map_err(|e| format!("failed to write virtual TSX {virtual_path:?}: {e}"))?;
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
            .map_err(|e| format!("failed to write tsconfig {tsconfig_path:?}: {e}"))?;
        let tsconfig_guard = VirtualFileGuard(tsconfig_path.clone());

        let virtual_wire = virtual_path.to_string_lossy().into_owned();
        let mode = api_mode_for(tsgo);
        let session = block_on(ProjectSession::spawn(
            ApiSpawnConfig::new(tsgo)
                .with_mode(mode)
                .with_cwd(&project_root),
            tsconfig_path.to_string_lossy().into_owned(),
            Some(virtual_wire.clone().into()),
        ))
        .map_err(|e| format!("failed to spawn corsa session: {e}"))?;

        // The tsconfig only needs to exist for the initial program load.
        drop(tsconfig_guard);
        let virtual_path = cleanup.0.clone();
        std::mem::forget(cleanup); // ownership transferred to the struct's Drop

        Ok(Self {
            session,
            tsx,
            forward_map: result.forward_map,
            props_anchor,
            virtual_wire,
            virtual_path,
            closed: false,
            types: Vec::new(),
            type_index: HashMap::new(),
            props_type_cache: None,
        })
    }

    /// Intern a type (handle + `ObjectFlags`) into a stable [`TypeId`], deduping
    /// by handle string. `None` handle ⇒ an unresolved type.
    fn intern(&mut self, handle: Option<TypeHandle>, object_flags: u32) -> TypeId {
        if let Some(h) = &handle {
            if let Some(&id) = self.type_index.get(h.as_str()) {
                return id;
            }
            let id = self.types.len() as TypeId;
            self.type_index.insert(h.as_str().to_string(), id);
            self.types.push(TypeSlot {
                handle: Some(h.clone()),
                object_flags,
            });
            id
        } else {
            let id = self.types.len() as TypeId;
            self.types.push(TypeSlot {
                handle: None,
                object_flags,
            });
            id
        }
    }

    fn handle_of(&self, id: TypeId) -> Option<TypeHandle> {
        self.types.get(id as usize).and_then(|s| s.handle.clone())
    }

    fn object_flags_of(&self, id: TypeId) -> u32 {
        self.types
            .get(id as usize)
            .map(|s| s.object_flags)
            .unwrap_or(0)
    }

    /// Resolve the props type handle from the injected anchor.
    fn compute_props_type(&mut self) -> Option<TypeId> {
        let offset = self.props_anchor?;
        let utf16 = byte_to_utf16(&self.tsx, offset);
        let file = self.virtual_wire.clone();
        let mut resp: Option<(TypeHandle, u32)> = None;
        if let Some(sym) = block_on(self.session.get_symbol_at_position(file.clone(), utf16))
            .ok()
            .flatten()
        {
            resp = block_on(self.session.get_type_of_symbol(sym.id))
                .ok()
                .flatten()
                .map(|t| (t.id, t.object_flags.unwrap_or(0)));
        }
        if resp.is_none() {
            resp = block_on(self.session.get_type_at_position(file, utf16))
                .ok()
                .flatten()
                .map(|t| (t.id, t.object_flags.unwrap_or(0)));
        }
        let (handle, flags) = resp?;
        Some(self.intern(Some(handle), flags))
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
            type_texts: probe.type_texts.iter().map(|s| s.to_string()).collect(),
            property_names: probe.property_names.iter().map(|s| s.to_string()).collect(),
            property_types: probe
                .property_types
                .iter()
                .map(|ts| ts.iter().map(|s| s.to_string()).collect())
                .collect(),
        })
    }

    fn close(&mut self) {
        if self.closed {
            return;
        }
        self.closed = true;
        let _ = block_on(self.session.close());
        let _ = std::fs::remove_file(&self.virtual_path);
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
        if let Some(cached) = self.props_type_cache {
            return cached;
        }
        let computed = self.compute_props_type();
        self.props_type_cache = Some(computed);
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
        .map(|infos| {
            infos
                .iter()
                .any(|i| !type_texts_are_any(&i.value_type.texts))
        })
        .unwrap_or(false);
        let bases =
            block_on(self.session.client().get_base_types(snap, proj, handle)).unwrap_or_default();
        let base_type_ids = bases
            .into_iter()
            .map(|t| self.intern(Some(t.id), t.object_flags.unwrap_or(0)))
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
                ptype.as_ref().map(|t| t.id.clone()),
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
fn same_file(a: &str, b: &str) -> bool {
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
    let mut clamped = usize::min(byte_offset as usize, source.len());
    while clamped > 0 && !source.is_char_boundary(clamped) {
        clamped -= 1;
    }
    source[..clamped].encode_utf16().count() as u32
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

/// Refresh the session after the virtual document changed on disk. Currently
/// unused (one document per backend) but kept for the warm-session path.
#[allow(dead_code)]
fn refresh_disk(session: &mut ProjectSession, wire: &str) -> Result<(), String> {
    block_on(
        session.refresh(Some(FileChanges::Summary(FileChangeSummary {
            changed: vec![wire.into()],
            created: Vec::new(),
            deleted: Vec::new(),
        }))),
    )
    .map_err(|e| format!("refresh failed: {e}"))
}
