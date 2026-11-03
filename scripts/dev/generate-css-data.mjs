// Regenerates `crates/rsvelte_language_server/src/css_data/` from the CSS data
// the official language server itself reads.
//
//   node scripts/dev/generate-css-data.mjs [--package-root <dir>]
//
// The version is read out of language-tools' `pnpm-lock.yaml` and the resolved
// package has to agree with it; the SHA-256 of every file read goes into the
// generated header, so the identity of the input is asserted from its content.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PACKAGE = "vscode-css-languageservice";
const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const LOCKFILE = path.join(ROOT, "submodules/language-tools/pnpm-lock.yaml");
const OUT_DIR = path.join(ROOT, "crates/rsvelte_language_server/src/css_data");
const OUTPUT = path.join(OUT_DIR, "web.rs");
const SVELTE_OUTPUT = path.join(OUT_DIR, "svelte_css.rs");
const ORACLE = path.join(
  ROOT,
  "crates/rsvelte_language_server/tests/data/css-documentation.json",
);

// `package.json` `main` is the umd build, so umd is what the official server
// loads; the esm copy of the same data hashes differently.
const DATA_FILE = "lib/umd/data/webCustomData.js";
const BUILTIN_FILE = "lib/umd/languageFacts/builtinData.js";
const COLORS_FILE = "lib/umd/languageFacts/colors.js";
const ENTRY_FILE = "lib/umd/languageFacts/entry.js";

const SELECTORS_REL = "packages/language-server/src/plugins/css/features/svelte-selectors.ts";
const SERVICE_REL = "packages/language-server/src/plugins/css/service.ts";
const SELECTORS_BUILD_REL =
  "packages/language-server/dist/src/plugins/css/features/svelte-selectors.js";
const SERVICE_BUILD_REL = "packages/language-server/dist/src/plugins/css/service.js";

const digest = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function lockedVersion() {
  const lock = fs.readFileSync(LOCKFILE, "utf8");
  const versions = new Set(
    [...lock.matchAll(new RegExp(`^  ${PACKAGE}@([^:\\s]+):`, "gm"))].map((m) => m[1]),
  );
  if (versions.size !== 1) {
    throw new Error(
      `${LOCKFILE} pins ${versions.size} versions of ${PACKAGE}: ${[...versions].join(", ")}`,
    );
  }
  return [...versions][0];
}

function packageRoot(override, version) {
  const candidate =
    override ??
    path.join(
      ROOT,
      "submodules/language-tools/node_modules/.pnpm",
      `${PACKAGE}@${version}/node_modules/${PACKAGE}`,
    );
  const manifest = path.join(candidate, "package.json");
  if (!fs.existsSync(manifest)) {
    throw new Error(
      `${PACKAGE} is not installed at ${candidate}. Run \`pnpm install\` in submodules/language-tools, or pass --package-root.`,
    );
  }
  const { name, version: resolved } = JSON.parse(fs.readFileSync(manifest, "utf8"));
  if (name !== PACKAGE || resolved !== version) {
    throw new Error(
      `${candidate} is ${name}@${resolved}, but ${LOCKFILE} pins ${PACKAGE}@${version}`,
    );
  }
  return candidate;
}

const string = (value) => JSON.stringify(value);
const option = (value) =>
  value === undefined || value === null ? "None" : `Some(${string(value)})`;
const slice = (items, render) =>
  items.length === 0 ? "&[]" : `&[${items.map(render).join(",")}]`;
const strings = (items) => slice(items ?? [], string);
// `getMissingBaselineBrowsers` opens with `if (!browsers) return ''`, so an
// absent list and an empty one are different answers.
const optionalStrings = (items) => (items === undefined ? "None" : `Some(${slice(items, string)})`);
const pairs = (object) =>
  slice(Object.entries(object), ([key, value]) => `(${string(key)},${string(value)})`);

// `CSSDataManager.collectData` keeps the first entry it sees per name, so a
// duplicate in the shipped data is never offered twice — rsvelte has no data
// manager, so the collection has to happen here.
const collect = (items) => {
  const seen = new Map();
  for (const item of items) {
    if (!seen.has(item.name)) seen.set(item.name, item);
  }
  return [...seen.values()];
};

const references = (entry) =>
  slice(
    entry.references ?? [],
    (r) => `Reference{name:${string(r.name)},url:${string(r.url)}}`,
  );

// `baseline.status` is `"high"` / `"low"` / `false`, and it is a DIFFERENT
// field from `status`, which here is a plain string the HTML data does not have.
function baseline(entry) {
  if (!entry.baseline) {
    return "None";
  }
  const status = {
    high: "BaselineStatus::High",
    low: "BaselineStatus::Low",
    false: "BaselineStatus::Limited",
  }[String(entry.baseline.status)];
  if (!status) {
    throw new Error(`unknown baseline status ${JSON.stringify(entry.baseline.status)}`);
  }
  return `Some(Baseline{status:${status},low_date:${option(entry.baseline.baseline_low_date)},high_date:${option(entry.baseline.baseline_high_date)}})`;
}

const value = (v) =>
  `Value{name:${string(v.name)},description:${option(v.description)},browsers:${optionalStrings(v.browsers)},baseline:${baseline(v)}}`;

const entry = (e) =>
  `Entry{name:${string(e.name)},description:${option(e.description)},browsers:${optionalStrings(e.browsers)},references:${references(e)},baseline:${baseline(e)},status:${option(e.status)}}`;

const property = (p) =>
  `Property{name:${string(p.name)},description:${option(p.description)},browsers:${optionalStrings(p.browsers)},references:${references(p)},baseline:${baseline(p)},status:${option(p.status)},syntax:${option(p.syntax)},relevance:${p.relevance ?? 0},restrictions:${strings(p.restrictions)},values:${slice(p.values ?? [], value)},at_rule:${option(p.atRule)}}`;

// `getEntryDescription` is ported by hand; the port is checked against the
// function itself, on every entry the data holds, in both markup kinds.
function writeOracle(entryModule, data, svelteData) {
  const { getEntryDescription, BaselineImages } = entryModule;
  const tokens = Object.entries(BaselineImages);
  const rows = {};
  // The three baseline images are ~1.5 KB of base64 each, so a token stands in
  // for them; they are pinned by the header's SHA-256 and by their own test.
  const substitute = (text) => {
    for (const [name, uri] of tokens) {
      text = text.split(uri).join(`<${name}>`);
    }
    return text;
  };
  const record = (key, item) => {
    const md = getEntryDescription(item, true, undefined);
    const txt = getEntryDescription(item, false, undefined);
    rows[key] = [md ? substitute(md.value) : null, txt ? substitute(txt.value) : null];
  };
  const kinds = {
    property: data.properties,
    "at-directive": data.atDirectives,
    "pseudo-class": data.pseudoClasses,
    "pseudo-element": data.pseudoElements,
  };
  for (const [kind, items] of Object.entries(kinds)) {
    // `:host` and `::cue` each appear twice with different content, so the
    // index is part of the key.
    items.forEach((item, index) => record(`${kind}:${index}:${item.name}`, item));
  }
  data.properties.forEach((p, index) => {
    (p.values ?? []).forEach((v, i) => record(`property:${index}:${p.name}/value:${i}:${v.name}`, v));
  });
  svelteData.pseudoClasses.forEach((item, index) =>
    record(`svelte-pseudo-class:${index}:${item.name}`, item),
  );
  fs.mkdirSync(path.dirname(ORACLE), { recursive: true });
  // The images are carried verbatim rather than as the token: substituting
  // them on both sides makes a corrupted constant replace itself, and the
  // comparison stays green.
  fs.writeFileSync(ORACLE, `${JSON.stringify({ images: BaselineImages, entries: rows })}\n`);
  process.stdout.write(`${path.relative(ROOT, ORACLE)}: ${Object.keys(rows).length} entries\n`);
}

// `service.ts` registers a custom data provider beside the built-in one, and
// `CSSDataManager.collectData` is FIRST-wins with the built-in pushed first —
// so a custom entry whose name the package already carries is shadowed. That
// is checked against the two live services rather than asserted, because a
// data bump can lift the shadow without either file changing.
function svelteAdditions(languageToolsRoot, packageDir) {
  const require = createRequire(import.meta.url);
  const built = (rel, src) => {
    const build = path.join(languageToolsRoot, rel);
    const source = path.join(languageToolsRoot, src);
    if (!fs.existsSync(build)) {
      throw new Error(
        `${build} is missing. Build language-tools (\`pnpm build\`) first, or pass --language-tools-root.`,
      );
    }
    if (fs.statSync(build).mtimeMs < fs.statSync(source).mtimeMs) {
      throw new Error(`${build} is older than ${source}; rebuild it.`);
    }
    return build;
  };
  const selectorsBuild = built(SELECTORS_BUILD_REL, SELECTORS_REL);
  const serviceBuild = built(SERVICE_BUILD_REL, SERVICE_REL);
  const { pseudoClass } = require(selectorsBuild);
  const { createLanguageServices } = require(serviceBuild);
  const cssService = require(path.join(packageDir, "lib/umd/cssLanguageService.js"));
  const { TextDocument } = require(
    // Resolved from the package that depends on it: pnpm's layout puts no copy
    // beside `packages/language-server`.
    require.resolve("vscode-languageserver-textdocument", { paths: [packageDir] }),
  );

  const plain = cssService.getCSSLanguageService();
  const svelte = createLanguageServices().css;
  const complete = (service, text, line, character) => {
    const doc = TextDocument.create("file:///probe.css", "css", 0, text);
    return service.doComplete(doc, { line, character }, service.parseStylesheet(doc)).items;
  };

  // A selector position: the only place the custom provider contributes.
  const selectorPlain = complete(plain, "a: {}", 0, 2).map((i) => i.label);
  const selectorSvelte = complete(svelte, "a: {}", 0, 2).map((i) => i.label);
  const added = selectorSvelte.filter((l) => !selectorPlain.includes(l));
  const removed = selectorPlain.filter((l) => !selectorSvelte.includes(l));
  const expected = pseudoClass.map((p) => p.name);
  if (removed.length > 0 || JSON.stringify(added) !== JSON.stringify(expected)) {
    throw new Error(
      `the custom provider adds ${JSON.stringify(added)} and removes ${JSON.stringify(removed)}, not ${JSON.stringify(expected)}`,
    );
  }
  // A property position: the custom provider declares two properties the
  // package already carries, so a deep comparison must find no difference.
  const declPlain = complete(plain, "a { }", 0, 4);
  const declSvelte = complete(svelte, "a { }", 0, 4);
  if (JSON.stringify(declPlain) !== JSON.stringify(declSvelte)) {
    throw new Error(
      "the custom provider's properties are no longer shadowed by the package's own data",
    );
  }
  return { pseudoClasses: pseudoClass, selectorsBuild, serviceBuild };
}

// `getEntryStatus` is module-private upstream, so its two literals are read
// back out of the function's own plaintext output — which opens with the
// prefix and then the description verbatim — rather than scanned out of the
// source. Every entry carrying a status has to agree on the prefix.
function statusPrefixes(entryModule, data) {
  const { getEntryDescription } = entryModule;
  const seen = {};
  const all = [...data.properties, ...data.atDirectives, ...data.pseudoClasses, ...data.pseudoElements];
  for (const item of all) {
    if (!item.status || !item.description) {
      continue;
    }
    const rendered = getEntryDescription(item, false, undefined);
    if (!rendered) {
      continue;
    }
    const at = rendered.value.indexOf(item.description);
    if (at === -1) {
      throw new Error(`${item.name}: the plaintext rendering does not contain its description`);
    }
    const prefix = rendered.value.slice(0, at);
    if (seen[item.status] !== undefined && seen[item.status] !== prefix) {
      throw new Error(
        `status ${item.status} renders two prefixes: ${JSON.stringify(seen[item.status])} and ${JSON.stringify(prefix)}`,
      );
    }
    seen[item.status] = prefix;
  }
  return seen;
}

function main() {
  const flag = process.argv.indexOf("--package-root");
  const override = flag === -1 ? undefined : path.resolve(process.argv[flag + 1]);
  const ltFlag = process.argv.indexOf("--language-tools-root");
  const languageToolsRoot =
    ltFlag === -1
      ? path.join(ROOT, "submodules/language-tools")
      : path.resolve(process.argv[ltFlag + 1]);
  const version = lockedVersion();
  const root = packageRoot(override, version);
  const require = createRequire(import.meta.url);
  const dataPath = path.join(root, DATA_FILE);
  const builtinPath = path.join(root, BUILTIN_FILE);
  const colorsPath = path.join(root, COLORS_FILE);
  const entryPath = path.join(root, ENTRY_FILE);
  const loaded = require(dataPath);
  const raw = loaded.cssData ?? loaded.default ?? loaded;
  const data = {
    ...raw,
    properties: collect(raw.properties),
    atDirectives: collect(raw.atDirectives),
    pseudoClasses: collect(raw.pseudoClasses),
    pseudoElements: collect(raw.pseudoElements),
  };
  const builtin = require(builtinPath);
  const colors = require(colorsPath);
  const entryModule = require(entryPath);

  const svelte = svelteAdditions(languageToolsRoot, root);
  const prefixes = statusPrefixes(entryModule, data);

  const header = `//! CSS property, at-directive and selector data, generated — do not edit.
//!
//! Source: ${PACKAGE}@${version} (MIT), the build \`package.json\` \`main\`
//! resolves to, which is the one the official language server loads.
//!
//!   ${DATA_FILE}
//!     sha256 ${digest(dataPath)}
//!   ${BUILTIN_FILE}
//!     sha256 ${digest(builtinPath)}
//!   ${COLORS_FILE}
//!     sha256 ${digest(colorsPath)}
//!   ${ENTRY_FILE}
//!     sha256 ${digest(entryPath)}
//!
//! Regenerate with \`node scripts/dev/generate-css-data.mjs\`.

`;

  const body = `/// A documentation link \`getEntryDescription\` renders after the prose.
pub struct Reference {
    pub name: &'static str,
    pub url: &'static str,
}

/// \`baseline.status\`, which is \`false\` rather than a string when a feature is
/// not baseline at all.
pub enum BaselineStatus {
    Limited,
    Low,
    High,
}

pub struct Baseline {
    pub status: BaselineStatus,
    pub low_date: Option<&'static str>,
    pub high_date: Option<&'static str>,
}

pub struct Value {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub browsers: Option<&'static [&'static str]>,
    pub baseline: Option<Baseline>,
}

/// An at-directive, pseudo-class or pseudo-element. \`status\` is a plain string
/// here (\`obsolete\` / \`nonstandard\` / \`experimental\`) and is not the baseline
/// object the HTML data spells with that name.
pub struct Entry {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub browsers: Option<&'static [&'static str]>,
    pub references: &'static [Reference],
    pub baseline: Option<Baseline>,
    pub status: Option<&'static str>,
}

pub struct Property {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub browsers: Option<&'static [&'static str]>,
    pub references: &'static [Reference],
    pub baseline: Option<Baseline>,
    pub status: Option<&'static str>,
    pub syntax: Option<&'static str>,
    pub relevance: u8,
    pub restrictions: &'static [&'static str],
    pub values: &'static [Value],
    pub at_rule: Option<&'static str>,
}

/// One entry of \`colorFunctions\`, whose fields the value completion reads
/// directly rather than through \`getEntryDescription\`.
pub struct ColorFunction {
    pub label: &'static str,
    pub func: &'static str,
    pub insert_text: &'static str,
    pub desc: &'static str,
}

pub const VERSION: &str = ${string(String(data.version))};

pub const BASELINE_LIMITED_IMAGE: &str = ${string(entryModule.BaselineImages.BASELINE_LIMITED)};
pub const BASELINE_LOW_IMAGE: &str = ${string(entryModule.BaselineImages.BASELINE_LOW)};
pub const BASELINE_HIGH_IMAGE: &str = ${string(entryModule.BaselineImages.BASELINE_HIGH)};

/// What \`getEntryStatus\` prepends, keyed by the \`status\` string it reads.
/// A status it has no arm for renders nothing and is absent here.
pub const STATUS_PREFIXES: &[(&str, &str)] = ${pairs(prefixes)};

pub const PROPERTIES: &[Property] = ${slice(data.properties, property)};

pub const AT_DIRECTIVES: &[Entry] = ${slice(data.atDirectives, entry)};

pub const PSEUDO_CLASSES: &[Entry] = ${slice(data.pseudoClasses, entry)};

pub const PSEUDO_ELEMENTS: &[Entry] = ${slice(data.pseudoElements, entry)};

pub const POSITION_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.positionKeywords)};

pub const REPEAT_STYLE_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.repeatStyleKeywords)};

pub const LINE_STYLE_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.lineStyleKeywords)};

pub const LINE_WIDTH_KEYWORDS: &[&str] = ${strings(builtin.lineWidthKeywords)};

pub const BOX_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.boxKeywords)};

pub const GEOMETRY_BOX_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.geometryBoxKeywords)};

pub const CSS_WIDE_KEYWORDS: &[(&str, &str)] = ${pairs(builtin.cssWideKeywords)};

pub const CSS_WIDE_FUNCTIONS: &[(&str, &str)] = ${pairs(builtin.cssWideFunctions)};

pub const IMAGE_FUNCTIONS: &[(&str, &str)] = ${pairs(builtin.imageFunctions)};

pub const TRANSITION_TIMING_FUNCTIONS: &[(&str, &str)] = ${pairs(builtin.transitionTimingFunctions)};

pub const BASIC_SHAPE_FUNCTIONS: &[(&str, &str)] = ${pairs(builtin.basicShapeFunctions)};

pub const UNITS: &[(&str, &[&str])] = ${slice(
    Object.entries(builtin.units),
    ([kind, list]) => `(${string(kind)},${strings(list)})`,
  )};

pub const HTML5_TAGS: &[&str] = ${strings(builtin.html5Tags)};

pub const SVG_ELEMENTS: &[&str] = ${strings(builtin.svgElements)};

pub const PAGE_BOX_DIRECTIVES: &[&str] = ${strings(builtin.pageBoxDirectives)};

pub const COLORS: &[(&str, &str)] = ${pairs(colors.colors)};

pub const COLOR_KEYWORDS: &[(&str, &str)] = ${pairs(colors.colorKeywords)};

pub const COLOR_FUNCTIONS: &[ColorFunction] = ${slice(
    colors.colorFunctions,
    (f) =>
      `ColorFunction{label:${string(f.label)},func:${string(f.func)},insert_text:${string(f.insertText)},desc:${string(f.desc)}}`,
  )};
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT, header + body);

  const svelteBody = slice(svelte.pseudoClasses, entry);
  const svelteImports = `use super::web::{${["Baseline", "BaselineStatus", "Entry", "Reference"]
    .filter((name) => name === "Entry" || svelteBody.includes(name))
    .join(", ")}};`;
  const svelteHeader = `//! Svelte's additions to the CSS data, generated — do not edit.
//!
//! Source: \`${SELECTORS_REL}\` and \`${SERVICE_REL}\` of language-tools, read
//! out of their build (MIT).
//!
//!   sha256 ${digest(path.join(languageToolsRoot, SELECTORS_REL))} (svelte-selectors.ts)
//!   sha256 ${digest(path.join(languageToolsRoot, SERVICE_REL))} (service.ts)
//!   sha256 ${digest(svelte.selectorsBuild)} (the svelte-selectors build read)
//!   sha256 ${digest(svelte.serviceBuild)} (the service build read)
//!
//! \`service.ts\` also declares \`vector-effect\` and \`print-color-adjust\`, which
//! [\`super::web\`] already carries — \`CSSDataManager.collectData\` is first-wins
//! with the built-in provider pushed first, so they are shadowed and contribute
//! nothing. The generator compares the two live services and refuses to write
//! this file if that stops holding.
//!
//! Regenerate with \`node scripts/dev/generate-css-data.mjs\`.

${svelteImports}

pub const SVELTE_PSEUDO_CLASSES: &[Entry] = ${svelteBody};
`;
  fs.writeFileSync(SVELTE_OUTPUT, svelteHeader);

  writeOracle(entryModule, data, { pseudoClasses: svelte.pseudoClasses });
  process.stdout.write(
    `${path.relative(ROOT, OUTPUT)}: ${data.properties.length} properties, ${data.atDirectives.length} at-directives, ${data.pseudoClasses.length} pseudo-classes, ${data.pseudoElements.length} pseudo-elements from ${PACKAGE}@${version}\n`,
  );
  process.stdout.write(
    `${path.relative(ROOT, SVELTE_OUTPUT)}: ${svelte.pseudoClasses.length} pseudo-class additions\n`,
  );
}

main();
