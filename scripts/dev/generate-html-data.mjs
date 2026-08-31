// Regenerates `crates/rsvelte_language_server/src/html_data/web.rs` from the
// HTML data the official language server itself reads.
//
//   node scripts/dev/generate-html-data.mjs [--package-root <dir>]
//
// The version is not a constant here: it is read out of language-tools'
// `pnpm-lock.yaml`, and the resolved package has to agree with it. The
// SHA-256 of every file read goes into the generated header, so the identity
// of the input is asserted from its content rather than from where it lived.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PACKAGE = "vscode-html-languageservice";
const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const LOCKFILE = path.join(ROOT, "submodules/language-tools/pnpm-lock.yaml");
const OUTPUT = path.join(
  ROOT,
  "crates/rsvelte_language_server/src/html_data/web.rs",
);
const ORACLE = path.join(
  ROOT,
  "crates/rsvelte_language_server/tests/data/html-documentation.json",
);
const PROVIDER_SOURCE_REL =
  "packages/language-server/src/plugins/html/dataProvider.ts";
const PROVIDER_BUILD_REL =
  "packages/language-server/dist/src/plugins/html/dataProvider.js";
const PROVIDER_SOURCE = path.join(ROOT, "submodules/language-tools", PROVIDER_SOURCE_REL);
const SVELTE_OUTPUT = path.join(
  ROOT,
  "crates/rsvelte_language_server/src/html_data/svelte_html.rs",
);
const SVELTE_ORACLE = path.join(
  ROOT,
  "crates/rsvelte_language_server/tests/data/svelte-html-attributes.json",
);
const DATA_FILE = "lib/umd/languageFacts/data/webCustomData.js";
// `package.json` `main` is the umd build, so umd is what the official server
// loads; the esm copy of the same data hashes differently.
const PROVIDER_FILE = "lib/umd/languageFacts/dataProvider.js";

function lockedVersion() {
  const lock = fs.readFileSync(LOCKFILE, "utf8");
  const versions = new Set(
    [...lock.matchAll(new RegExp(`^  ${PACKAGE}@([^:\\s]+):`, "gm"))].map(
      (match) => match[1],
    ),
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
  const { name, version: resolved } = JSON.parse(
    fs.readFileSync(manifest, "utf8"),
  );
  if (name !== PACKAGE || resolved !== version) {
    throw new Error(
      `${candidate} is ${name}@${resolved}, but ${LOCKFILE} pins ${PACKAGE}@${version}`,
    );
  }
  return candidate;
}

const digest = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const string = (value) => JSON.stringify(value);
const option = (value) => (value === undefined ? "None" : `Some(${string(value)})`);

/// `normalizeMarkupContent` (`utils/markup.js`) reads both spellings of a
/// description as markdown, so only the text survives the round trip.
const description = (item) =>
  option(
    typeof item.description === "string"
      ? item.description
      : item.description?.value,
  );

const slice = (items, render) =>
  items.length === 0 ? "&[]" : `&[${items.map(render).join(",")}]`;

const references = (item) =>
  slice(
    item.references ?? [],
    (reference) =>
      `Reference{name:${string(reference.name)},url:${string(reference.url)}}`,
  );

const browsers = (item) =>
  slice(item.browsers ?? [], (browser) => string(browser));

function status(item) {
  if (!item.status) {
    return "None";
  }
  const baseline = {
    high: "Baseline::High",
    low: "Baseline::Low",
    false: "Baseline::Limited",
  }[String(item.status.baseline)];
  if (!baseline) {
    throw new Error(`unknown baseline ${JSON.stringify(item.status.baseline)}`);
  }
  return `Some(Status{baseline:${baseline},low_date:${option(item.status.baseline_low_date)},high_date:${option(item.status.baseline_high_date)}})`;
}

const attribute = (item) =>
  `Attribute{name:${string(item.name)},description:${description(item)},value_set:${option(item.valueSet)},references:${references(item)},browsers:${browsers(item)},status:${status(item)}}`;

const value = (item) =>
  `Value{name:${string(item.name)},description:${description(item)}}`;

const tag = (item) =>
  `Tag{name:${string(item.name)},description:${description(item)},void_element:${item.void === true},attributes:${slice(item.attributes ?? [], attribute)},references:${references(item)},browsers:${browsers(item)},status:${status(item)}}`;

const valueSet = (item) =>
  `ValueSet{name:${string(item.name)},values:${slice(item.values, value)}}`;

// The port of `generateDocumentation` is checked against the function itself,
// on every entry the data holds. The three baseline images are substituted for
// a token on both sides: they are pinned by the SHA-256 in the header and by
// their own equality test, and inlining ~1.5 KB of base64 per row would make
// this file 1.2 MB.
function writeOracle(providerPath, htmlData, images) {
  const require = createRequire(import.meta.url);
  const { generateDocumentation } = require(providerPath);
  const tokens = Object.entries(images);
  const render = (item, markdown) => {
    const result = generateDocumentation(item, {}, markdown);
    if (!result) {
      return null;
    }
    let value = result.value;
    for (const [name, uri] of tokens) {
      value = value.split(uri).join(`<${name}>`);
    }
    return value;
  };
  const rows = {};
  const record = (key, item) => {
    rows[key] = [render(item, true), render(item, false)];
  };
  // Three tags declare the same attribute name twice with different content
  // (`link`/`img` `importance`, `iframe` `allowpaymentrequest`), so the index
  // is part of the key.
  htmlData.tags.forEach((tag) => {
    record(`tag:${tag.name}`, tag);
    (tag.attributes ?? []).forEach((attribute, index) => {
      record(`tag:${tag.name}/attr:${index}:${attribute.name}`, attribute);
    });
  });
  htmlData.globalAttributes.forEach((attribute, index) => {
    record(`global:${index}:${attribute.name}`, attribute);
  });
  fs.mkdirSync(path.dirname(ORACLE), { recursive: true });
  // The images are carried verbatim rather than as the token: substituting
  // them on both sides makes a corrupted constant replace itself, and the
  // comparison stays green.
  fs.writeFileSync(ORACLE, `${JSON.stringify({ images, entries: rows })}\n`);
  process.stdout.write(
    `${path.relative(ROOT, ORACLE)}: ${Object.keys(rows).length} entries\n`,
  );
}

// `svelteHtmlDataProvider` (`plugins/html/dataProvider.ts`) merges the data
// above with Svelte's own tags and directives, and that merged provider is what
// the official server serves. Only the DIFFERENCE is emitted here — the merge
// itself is ported in `html_data/provider.rs` — and the generator refuses to
// write anything unless replaying that port reproduces the provider exactly.
function writeSvelteProvider(htmlData, languageToolsRoot) {
  const build = path.join(languageToolsRoot, PROVIDER_BUILD_REL);
  if (!fs.existsSync(build)) {
    throw new Error(
      `${build} is missing. Build language-tools (\`pnpm build\`) first, or pass --language-tools-root.`,
    );
  }
  // The build is not checked in, so its provenance comes from its own source:
  // whichever tree it was built in has to hold the source this repository pins.
  const built_from = path.join(languageToolsRoot, PROVIDER_SOURCE_REL);
  if (digest(built_from) !== digest(PROVIDER_SOURCE)) {
    throw new Error(
      `${built_from} is not the ${PROVIDER_SOURCE} this repository pins`,
    );
  }
  if (fs.statSync(build).mtimeMs < fs.statSync(built_from).mtimeMs) {
    throw new Error(`${build} is older than ${built_from}; rebuild it.`);
  }
  const require = createRequire(import.meta.url);
  const provider = require(build).svelteHtmlDataProvider;

  // Split positionally, not by name: Svelte declares its own `slot` tag, and
  // `_tagMap` is last-wins while `provideTags` returns both.
  const prefix = provider._tags.slice(0, htmlData.tags.length);
  if (prefix.some((tag, index) => tag.name !== htmlData.tags[index].name)) {
    throw new Error("the provider does not open with the upstream tags in order");
  }
  const svelteTags = provider._tags.slice(htmlData.tags.length);
  const webGlobals = new Set(htmlData.globalAttributes.map((a) => a.name));
  const globalAdditions = provider._globalAttributes.filter(
    (a) => !webGlobals.has(a.name),
  );
  const svelteEvent = (name) => name.replace(/^on/, "on:");
  const tagAdditions = [];
  for (const tag of htmlData.tags) {
    const merged = provider._tagMap[tag.name].attributes;
    const extra = merged.slice(tag.attributes.length);
    if (extra.length > 0) {
      tagAdditions.push([tag.name, extra]);
    }
  }

  // The port, replayed here: rename every upstream `on…`, append the per-tag
  // additions, then answer `provideAttributes` the way the provider does.
  const replayTag = (tag) => ({
    ...tag,
    attributes: [
      ...tag.attributes.map((a) => ({ ...a, name: svelteEvent(a.name) })),
      ...(tagAdditions.find(([name]) => name === tag.name)?.[1] ?? []),
    ],
  });
  const replayedTags = [...htmlData.tags.map(replayTag), ...svelteTags];
  const replayed = new Map(replayedTags.map((tag) => [tag.name, tag]));
  const globals = [...htmlData.globalAttributes, ...globalAdditions];
  const ownOnly = new Set(["svelte:boundary", "svelte:options"]);
  const replayAttributes = (name) =>
    ownOnly.has(name)
      ? (svelteTags.find((tag) => tag.name === name)?.attributes ?? [])
      : [...(replayed.get(name)?.attributes ?? []), ...globals];

  const rows = {};
  for (const tag of provider.provideTags()) {
    const expected = provider.provideAttributes(tag.name);
    const actual = replayAttributes(tag.name);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      throw new Error(
        `replaying the merge does not reproduce provideAttributes(${tag.name})`,
      );
    }
    rows[tag.name] = expected.map((attribute) => attribute.name);
  }
  if (JSON.stringify(provider.provideTags()) !== JSON.stringify(replayedTags)) {
    throw new Error("replaying the merge does not reproduce provideTags()");
  }

  const body = `pub const SVELTE_TAGS: &[Tag] = ${slice(svelteTags, tag)};

pub const GLOBAL_ADDITIONS: &[Attribute] = ${slice(globalAdditions, attribute)};
`;
  const svelteImports = `use super::web::{Attribute, ${["Baseline", "Reference", "Status"]
    .filter((name) => body.includes(name))
    .map((name) => `${name}, `)
    .join("")}Tag};`;
  const header = `//! Svelte's additions to the HTML data, generated — do not edit.
//!
//! Source: \`packages/language-server/src/plugins/html/dataProvider.ts\` of
//! language-tools, read out of its build (MIT).
//!
//!   sha256 ${digest(PROVIDER_SOURCE)} (the TypeScript source)
//!   sha256 ${digest(build)} (the build read)
//!
//! Only what \`svelteHtmlDataProvider\` adds to [\`super::web\`] is here; the
//! merge is ported in [\`super::provider\`], and the generator refuses to write
//! this file unless replaying that port reproduces the provider exactly.
//!
//! Regenerate with \`node scripts/dev/generate-html-data.mjs\`.

${svelteImports}

pub const SVELTE_TAGS: &[Tag] = ${slice(svelteTags, tag)};

pub const GLOBAL_ADDITIONS: &[Attribute] = ${slice(globalAdditions, attribute)};

/// Appended to the named tag's own attributes, after the \`on:\` rename.
pub const TAG_ADDITIONS: &[(&str, &[Attribute])] = ${slice(
    tagAdditions,
    ([name, extra]) => `(${string(name)},${slice(extra, attribute)})`,
  )};

/// These two are served their own attributes and no globals.
pub const OWN_ATTRIBUTES_ONLY: &[&str] = &["svelte:boundary", "svelte:options"];
`;
  fs.writeFileSync(SVELTE_OUTPUT, header);
  fs.writeFileSync(SVELTE_ORACLE, `${JSON.stringify(rows)}\n`);
  process.stdout.write(
    `${path.relative(ROOT, SVELTE_OUTPUT)}: ${svelteTags.length} tags, ${globalAdditions.length} global additions, ${tagAdditions.length} tags with additions\n`,
  );
}

function main() {
  const flag = process.argv.indexOf("--package-root");
  const override = flag === -1 ? undefined : path.resolve(process.argv[flag + 1]);
  const languageToolsFlag = process.argv.indexOf("--language-tools-root");
  const languageToolsRoot =
    languageToolsFlag === -1
      ? path.join(ROOT, "submodules/language-tools")
      : path.resolve(process.argv[languageToolsFlag + 1]);
  const version = lockedVersion();
  const root = packageRoot(override, version);
  const dataPath = path.join(root, DATA_FILE);
  const providerPath = path.join(root, PROVIDER_FILE);
  const require = createRequire(import.meta.url);
  const { htmlData } = require(dataPath);
  const { BaselineImages } = require(providerPath);

  const header = `//! HTML tag and attribute data, generated — do not edit.
//!
//! Source: ${PACKAGE}@${version} (MIT), the build \`package.json\` \`main\`
//! resolves to, which is the one the official language server loads.
//!
//!   ${DATA_FILE}
//!     sha256 ${digest(dataPath)}
//!   ${PROVIDER_FILE}
//!     sha256 ${digest(providerPath)}
//!
//! Regenerate with \`node scripts/dev/generate-html-data.mjs\`.

`;

  const body = `/// A documentation link \`generateDocumentation\` renders after the prose.
pub struct Reference {
    pub name: &'static str,
    pub url: &'static str,
}

/// \`status.baseline\`, which is \`false\` rather than a string when a feature is
/// not baseline at all.
pub enum Baseline {
    Limited,
    Low,
    High,
}

pub struct Status {
    pub baseline: Baseline,
    pub low_date: Option<&'static str>,
    pub high_date: Option<&'static str>,
}

pub struct Value {
    pub name: &'static str,
    pub description: Option<&'static str>,
}

pub struct Attribute {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub value_set: Option<&'static str>,
    pub references: &'static [Reference],
    pub browsers: &'static [&'static str],
    pub status: Option<Status>,
}

pub struct Tag {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub void_element: bool,
    pub attributes: &'static [Attribute],
    pub references: &'static [Reference],
    pub browsers: &'static [&'static str],
    pub status: Option<Status>,
}

pub struct ValueSet {
    pub name: &'static str,
    pub values: &'static [Value],
}

pub const VERSION: &str = ${string(String(htmlData.version))};

pub const BASELINE_LIMITED_IMAGE: &str = ${string(BaselineImages.BASELINE_LIMITED)};
pub const BASELINE_LOW_IMAGE: &str = ${string(BaselineImages.BASELINE_LOW)};
pub const BASELINE_HIGH_IMAGE: &str = ${string(BaselineImages.BASELINE_HIGH)};

pub const TAGS: &[Tag] = ${slice(htmlData.tags, tag)};

pub const GLOBAL_ATTRIBUTES: &[Attribute] = ${slice(htmlData.globalAttributes, attribute)};

pub const VALUE_SETS: &[ValueSet] = ${slice(htmlData.valueSets, valueSet)};
`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, header + body);
  writeOracle(providerPath, htmlData, BaselineImages);
  writeSvelteProvider(htmlData, languageToolsRoot);
  process.stdout.write(
    `${path.relative(ROOT, OUTPUT)}: ${htmlData.tags.length} tags, ${htmlData.globalAttributes.length} global attributes, ${htmlData.valueSets.length} value sets from ${PACKAGE}@${version}\n`,
  );
}

main();
