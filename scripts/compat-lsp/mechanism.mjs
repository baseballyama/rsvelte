// One mechanism label per divergence, drawn from a closed vocabulary.
//
// The label goes into the ratchet key, so it must be derived from the OBSERVED
// pair alone and must not encode the measured content: a key carrying a digest
// of the difference changes the moment a mechanism is partly fixed, and CI
// reads the new key as a NEW failure instead of as progress.
// The pairing key `diff.mjs` uses, minus `label` (a differing label is a real
// set difference and is classified as one).
import { identity } from "./diff.mjs";
const PAIRING_KEY_FIELDS = ["kind", "sortText", "filterText"];
const PAIRING_KEY_SLUG = { kind: "kind", sortText: "sort-text", filterText: "filter-text" };
const COMPLETION_PROVIDERS = ["ts", "html", "html-close-tag", "css", "svg", "emmet", "other", "mixed"];
function pairingKeyLabelSpace() {
  const space = [];
  for (let mask = 1; mask < 1 << PAIRING_KEY_FIELDS.length; mask += 1)
    space.push(
      PAIRING_KEY_FIELDS.filter((_, index) => mask & (1 << index))
        .map((field) => PAIRING_KEY_SLUG[field])
        .join("+"),
    );
  return space;
}

// The label a divergence carries when no rule in this file claims it, and the
// one every non-corpus entry carries because the classifier does not run there.
// Spelled once so a caller outside this file cannot drift from it.
export const UNCLASSIFIED = "unclassified";

export const MECHANISMS = [
  // Architectural: rsvelte proxies tsgo, official bundles `typescript`.
  "ts-lib-copy",
  // One label per rewrite in `TS_RENDER_RULES`: a rendering a `tsgo --lsp`
  // hover spells differently from `tsc`'s quick info.
  "ts-render-union-order",
  "ts-render-quote-style",
  "ts-render-local-modifier",
  "ts-render-jsdoc-tag",
  "ts-render-import-line",
  "ts-render-overload-count",
  "ts-render-declaration-order",
  // Official's whole hover is the import origin line, which tsgo drops -- so
  // dropping it leaves tsgo with nothing to answer.
  "rsvelte-empty-import-only",
  // rsvelte answers a definition with the very token the request sat on.
  "official-empty-target-is-the-request",
  // Two of the renderings at once. Named for the pair rather than for either
  // one, because a label that a rule wins by its position in the table makes
  // the ratchet key depend on the order the rules were written in.
  "ts-render-multiple",
  // Not a rendering difference at all: the same declaration, typed.
  "ts-type-any",
  // The residual: a hover text no rewrite in `TS_RENDER_RULES` explains. It is NOT
  // attributed to tsgo -- the same probe shows `tsc` and `tsgo` agreeing on the
  // shapes this bucket holds, so which side is wrong is unmeasured.
  "ts-render",
  "ts-symbol-kind",
  "ts-symbol-name",
  // official answers about a `*.svelte.ts` shadow that exists in no editor.
  "official-defect-svelte-ts-shadow",
  // Language-data providers (CSS / HTML) rather than TypeScript.
  "css-data",
  "html-data",
  "provider-routing",
  // One side declines to answer.
  "rsvelte-empty",
  "official-empty",
  // rsvelte's `.svelte` <-> `.tsx` position projection.
  "projection-origin-range",
  ...["declaration", "workspace"].map((where) => `projection-target-position-${where}`),
  "projection-response-range",
  // official resolves an imported component to its file; rsvelte stops at the
  // import specifier in the requesting document.
  "target-component-vs-import",
  // official lands in a package's `.d.ts`, rsvelte in the package source.
  "target-declaration-vs-source",
  "target-file-mismatch",
  // completion payload fields. The item set splits by the PROVIDER the differing
  // items come from, because one `/items` difference hid TypeScript, HTML tag,
  // HTML attribute and CSS data gaps under one name.
  ...["missing", "extra"].flatMap((direction) =>
    ["ts", "html", "html-close-tag", "css", "svg", "emmet", "other", "mixed"].map(
      (provider) => `completion-item-set-${direction}-${provider}`,
    ),
  ),
  // Measured on melt-ui: the arrays differ (18.9% of label-paired items, upstream
  // omits the `(` at a new-identifier location) and upstream omits the field
  // outright (8.1%) are two mechanisms one label hid.
  // `diff.mjs` pairs items by a digest of (label, kind, sortText, filterText),
  // so an item whose label matches and whose pairing-key field does not is
  // unpaired in BOTH directions while the label sets agree. Which fields
  // disagree is the mechanism; it says nothing about which side is right.
  // Crossed with the provider, because the same differing FIELD carries two
  // different terminals: a TypeScript item's `kind` is the recorded tsgo
  // divergence, and an HTML tag's `kind` is rsvelte's own completion falling
  // through. One label cannot take both.
  ...pairingKeyLabelSpace().flatMap((suffix) =>
    COMPLETION_PROVIDERS.map((provider) => `completion-item-pairing-key-${suffix}-${provider}`),
  ),
  "completion-item-duplicate-label",
  "completion-commit-characters-value-extra-paren",
  "completion-commit-characters-value-other",
  "completion-commit-characters-presence-rsvelte-only",
  "completion-commit-characters-presence-official-only",
  ...[
    "presence-rsvelte-only",
    "presence-official-only",
    "value",
  ].map((suffix) => `completion-command-${suffix}`),
  // Two labels each hid two mechanisms: a field one side never writes, and a
  // value both sides write and compute differently. The sub-key is read off
  // the difference pointer, so it names what diverged and not who is right.
  ...[
    "presence-rsvelte-only",
    "presence-official-only",
    "range-start",
    "range-end",
    "range-other",
    "other",
  ].map((suffix) => `completion-text-edit-${suffix}`),
  // `new-text` carries the provider, because the two arms measured on it are an
  // HTML attribute snippet (`accesskey="$1"`) and a module specifier trimmed to
  // the part after the word range -- two builders, not two spellings.
  ...COMPLETION_PROVIDERS.map((provider) => `completion-text-edit-new-text-${provider}`),
  ...["presence-rsvelte-only", "presence-official-only", "other"].map(
    (suffix) => `completion-additional-text-edits-${suffix}`,
  ),
  ...[
    "source-rsvelte-only",
    "source-official-only",
    "uri",
    "position",
    "name",
    "other",
  ].map((suffix) => `completion-item-data-${suffix}`),
  "completion-is-incomplete",
  // `detail`, `documentation` and `labelDetails` are three fields with three
  // producers; one label reported an extra `detail` and an absent
  // `documentation` as the same thing.
  ...["detail", "documentation", "label-details"].flatMap((field) =>
    ["presence-rsvelte-only", "presence-official-only", "value"].map(
      (suffix) => `completion-item-${field}-${suffix}`,
    ),
  ),
  UNCLASSIFIED,
];

const MECHANISM_SET = new Set(MECHANISMS);

const isEmptyResult = (value) =>
  value === null ||
  value === undefined ||
  (Array.isArray(value) && value.length === 0);

const asList = (value) =>
  Array.isArray(value) ? value : value === null || value === undefined ? [] : [value];

const targetUri = (item) => String(item.targetUri ?? item.uri ?? "");
const targetStart = (item) => (item.targetSelectionRange ?? item.range ?? {}).start;

// The two servers load two different copies of the TypeScript lib: official
// resolves `typescript/lib/lib.*.d.ts`, rsvelte gets the copy tsgo ships.
const isLibFile = (uri) => /\/lib\/lib\.[^/]*\.d\.ts$/.test(uri);
const isSvelteShadow = (uri) => /\.svelte\.ts$/.test(uri);

// rsvelte's CSS hover is a name-only stub; official serves the MDN description.
const RSVELTE_CSS_STUB = /^`[^`]+` CSS property$|^`:global\(\.\.\.\)` prevents/;
// A hover body whatever its shape: TypeScript sends a bare string here and
// `plaintextOf` answers only for the language-data payloads.
const markupTextOf = (contents) =>
  typeof contents === "string"
    ? contents
    : contents && !Array.isArray(contents) && typeof contents.value === "string"
      ? contents.value
      : null;

const plaintextOf = (contents) =>
  contents && typeof contents === "object" && !Array.isArray(contents) &&
  contents.kind === "plaintext"
    ? contents.value
    : null;

function hoverDataKind(hover) {
  if (!hover) return null;
  const contents = hover.contents;
  // A CSS selector hover is upstream's only array-shaped payload.
  if (Array.isArray(contents)) return "css";
  const text = plaintextOf(contents);
  if (text === null) return null;
  if (RSVELTE_CSS_STUB.test(text)) return "css";
  if (text.includes("developer.mozilla.org/docs/Web/CSS/")) return "css";
  if (text.includes("developer.mozilla.org/docs/Web/HTML/")) return "html";
  // The MDN reference line is the only reliable discriminator; a plaintext
  // payload without one is language data of an unknown flavour.
  return "data";
}

// `(method) String.replace`, `var undefined`, `module "svelte/elements"` — the
// leading declaration line names the symbol the server resolved, which
// separates "the same symbol rendered differently" from "a different symbol".
function declarationHead(text) {
  const fenced = /```typescript\n([\s\S]*?)(?:\n```|$)/.exec(text);
  const first = (fenced ? fenced[1] : text).split("\n")[0];
  const tagged = /^\(([^)]*)\)\s*(.*)$/.exec(first);
  if (tagged) {
    const name = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/.exec(tagged[2]);
    return { kind: tagged[1], name: name ? name[1] : "" };
  }
  const keyword =
    /^(var|let|const|function|class|interface|type|namespace|module|enum|import|new|abstract class)\s+(.*)$/.exec(
      first,
    );
  if (keyword) {
    const name = /^(["'][^"']*["']|[A-Za-z_$][\w$]*)/.exec(keyword[2]);
    return { kind: keyword[1], name: name ? name[1] : "" };
  }
  return { kind: "?", name: first.slice(0, 32) };
}

// Each `tsgo` rendering that differs from `tsc`'s quick info, written as the
// rewrite that makes the two texts equal. The rewrite decides the LABEL only --
// it never decides whether the entry diverges -- so it cannot hide a
// difference.
const sortUnions = (text) =>
  text.replace(/(?:"[^"]*"|'[^']*'|[\w.$<>[\]]+)(?:\s*\|\s*(?:"[^"]*"|'[^']*'|[\w.$<>[\]]+))+/g, (run) =>
    run
      .split("|")
      .map((part) => part.trim())
      .sort()
      .join(" | "),
  );
const normalizeImportQuotes = (text) =>
  text.replace(/import\('([^']*)'\)/g, 'import("$1")');
// `(local function) f()` against `function f()`: the qualifier is dropped, the
// kind word is not.
const dropLocalModifier = (text) =>
  text.replace(/\(local (function|var|let|const|class|method|property)\)/g, "$1");
// tsc names the import a symbol came through on its own line; tsgo omits it.
const dropImportLine = (text) =>
  text
    .split("\n")
    .filter((line) => !/^import [\w$]+$/.test(line))
    .join("\n");
// `(+3 overloads)` / `(+1 overload)`: tsc counts the overloads it did not print.
const dropOverloadCount = (text) => text.replace(/ \(\+\d+ overloads?\)/g, "");
// A merged symbol prints one line per declaration, and the two disagree on the
// order. Only the fenced code block is sorted, so prose cannot be reordered into
// equality.
const sortDeclarationLines = (text) =>
  text.replace(/```typescript\n([\s\S]*?)\n```/, (block, body) =>
    block.replace(body, body.split("\n").sort().join("\n")),
  );
const dropJsdocTags = (text) =>
  text
    .split("\n")
    .filter((line) => !/^\s*\*@[A-Za-z]+\*/.test(line))
    .join("\n")
    .trimEnd();

// Applied in a fixed order so one input cannot land on two labels; the first
// rewrite that makes the two texts equal names the mechanism.
const TS_RENDER_RULES = [
  ["ts-render-union-order", sortUnions],
  ["ts-render-quote-style", normalizeImportQuotes],
  ["ts-render-local-modifier", dropLocalModifier],
  ["ts-render-jsdoc-tag", dropJsdocTags],
  ["ts-render-import-line", dropImportLine],
  ["ts-render-overload-count", dropOverloadCount],
  ["ts-render-declaration-order", sortDeclarationLines],
];

// The same declaration with the type erased: rsvelte answers `any` where
// official names a type, which no rewrite can express because it is not a
// rendering difference. Every differing line must have the shape, so a genuinely
// different symbol whose type happens to be `any` cannot match.
function differsOnlyByAny(official, rsvelte) {
  const left = official.split("\n");
  const right = rsvelte.split("\n");
  if (left.length !== right.length) return false;
  let differing = 0;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] === right[i]) continue;
    differing += 1;
    if (!right[i].endsWith("any")) return false;
    if (left[i].slice(0, right[i].length - 3) !== right[i].slice(0, -3)) return false;
  }
  return differing > 0;
}

// Order-free by construction: a rule never wins because of where it sits in the
// table, so the ratchet key cannot change when a rule is added above another.
function classifyTsRender(left, right) {
  const sufficient = TS_RENDER_RULES.filter(([, rewrite]) => rewrite(left) === rewrite(right));
  if (sufficient.length === 1) return sufficient[0][0];
  if (sufficient.length > 1) return "ts-render-multiple";
  const all = (text) => TS_RENDER_RULES.reduce((acc, [, rewrite]) => rewrite(acc), text);
  if (all(left) === all(right)) return "ts-render-multiple";
  if (differsOnlyByAny(left, right)) return "ts-type-any";
  return "ts-render";
}

// The whole answer is the `import <Name>` line `ts-render-import-line` names,
// so this is that omission with nothing left behind it rather than a second
// mechanism that happens to be empty.
function importOnlyBody(text) {
  const fenced = /^```typescript\n([\s\S]*?)\n```$/.exec(text.trim());
  if (!fenced) return false;
  const lines = fenced[1].split("\n");
  return lines.length === 1 && /^import [\w$]+$/.test(lines[0]);
}

function classifyHover(official, rsvelte) {
  if (isEmptyResult(official) && !isEmptyResult(rsvelte)) return "official-empty";
  if (!isEmptyResult(official) && isEmptyResult(rsvelte)) {
    const kind = hoverDataKind(official);
    if (kind === "css") return "css-data";
    if (kind === "html") return "html-data";
    // The subject's NAME, not any `$$` in the text: a real symbol's type often
    // mentions `$$ComponentProps` while the hover is about the user's own
    // declaration, and only the former is official answering about the shadow.
    const subject = markupTextOf(official.contents);
    if (subject !== null && importOnlyBody(subject)) return "rsvelte-empty-import-only";
    if (subject !== null && declarationHead(subject).name.startsWith("$$"))
      return "official-defect-svelte-ts-shadow";
    return "rsvelte-empty";
  }
  if (isEmptyResult(official) || isEmptyResult(rsvelte)) return UNCLASSIFIED;
  const left = official.contents;
  const right = rsvelte.contents;
  const leftKind = hoverDataKind(official);
  const rightKind = hoverDataKind(rsvelte);
  if (JSON.stringify(left) === JSON.stringify(right)) return "projection-response-range";
  // One side answered with language data and the other with TypeScript.
  if ((leftKind === null) !== (rightKind === null)) return "provider-routing";
  if (leftKind !== null) {
    if (leftKind === "css" || rightKind === "css") return "css-data";
    if (leftKind === "html" || rightKind === "html") return "html-data";
    return UNCLASSIFIED;
  }
  if (typeof left !== "string" || typeof right !== "string") return UNCLASSIFIED;
  // Ahead of the head comparison, because `(local function) f()` vs `function
  // f()` reads as a KIND disagreement and is one of the `TS_RENDER_RULES`.
  // Each rule demands full equality after its rewrite, so a genuinely different
  // symbol cannot match one.
  const rendered = classifyTsRender(left, right);
  if (rendered !== "ts-render") return rendered;
  const leftHead = declarationHead(left);
  const rightHead = declarationHead(right);
  if (leftHead.name !== rightHead.name) return "ts-symbol-name";
  if (leftHead.kind !== rightHead.kind) return "ts-symbol-kind";
  return "ts-render";
}

// Whether rsvelte's own answer covers the position that was asked about. The
// alternative -- listing the words official resolves nothing at -- needs a
// vocabulary, and the document is three languages at once: the sampled residue
// is `type`, `as` and Svelte's `snippet`.
function targetCoversRequest(rsvelte, position) {
  if (!position) return false;
  const first = asList(rsvelte)[0];
  const range = first?.targetSelectionRange ?? first?.range;
  if (!range) return false;
  const { line, character } = position;
  if (range.start.line > line || range.end.line < line) return false;
  if (range.start.line === line && range.start.character > character) return false;
  if (range.end.line === line && range.end.character < character) return false;
  return true;
}

function classifyDefinition(official, rsvelte, difference, position) {
  if (isEmptyResult(official) && !isEmptyResult(rsvelte))
    return targetCoversRequest(rsvelte, position)
      ? "official-empty-target-is-the-request"
      : "official-empty";
  if (!isEmptyResult(official) && isEmptyResult(rsvelte)) return "rsvelte-empty";
  const left = asList(official);
  const right = asList(rsvelte);
  if (!left.length || !right.length) return UNCLASSIFIED;
  // A field-level pointer names the field directly.
  if (difference.includes("originSelectionRange")) return "projection-origin-range";
  const identity = (item) => {
    const start = targetStart(item) ?? {};
    return `${targetUri(item)}|${start.line}:${start.character}`;
  };
  const leftKeys = new Set(left.map(identity));
  const rightKeys = new Set(right.map(identity));
  const onlyLeft = [...leftKeys].filter((key) => !rightKeys.has(key));
  const onlyRight = [...rightKeys].filter((key) => !leftKeys.has(key));
  if (!onlyLeft.length && !onlyRight.length) return "projection-origin-range";
  const uriOf = (key) => key.slice(0, key.lastIndexOf("|"));
  const all = [...onlyLeft, ...onlyRight];
  if (all.every((key) => isLibFile(uriOf(key)))) return "ts-lib-copy";
  if (onlyLeft.some((key) => isSvelteShadow(uriOf(key))))
    return "official-defect-svelte-ts-shadow";
  if (new Set(all.map(uriOf)).size === 1)
    return /\.d\.ts$/.test(uriOf(all[0]))
      ? "projection-target-position-declaration"
      : "projection-target-position-workspace";
  const isComponent = (uri) => /\.svelte$/.test(uri);
  if (onlyLeft.every((key) => isComponent(uriOf(key))) &&
      onlyRight.every((key) => isComponent(uriOf(key))))
    return "target-component-vs-import";
  if (onlyLeft.every((key) => /\.d\.ts$/.test(uriOf(key))) &&
      onlyRight.every((key) => !/\.d\.ts$/.test(uriOf(key))))
    return "target-declaration-vs-source";
  return "target-file-mismatch";
}

// Which embedded region an offset sits in. A completion item that cites no MDN
// page cannot be attributed from its own fields, and WHERE the request was made
// is an input property, so it cannot encode which side is correct.
const REGION_TAG = /<(style|script)\b[^>]*>|<\/(style|script)\s*>/gi;
export function regionAt(text, offset) {
  let region = "markup";
  let open = null;
  REGION_TAG.lastIndex = 0;
  for (let match; (match = REGION_TAG.exec(text)); ) {
    // The boundary is the outside edge of both tags: an offset inside `<style>`
    // has not entered the region and one inside `</style>` has not left it.
    if (match.index + match[0].length > offset) break;
    if (match[1]) {
      open = match[1].toLowerCase();
      region = open;
    } else if (match[2] && match[2].toLowerCase() === open) {
      open = null;
      region = "markup";
    }
  }
  return region;
}

export function offsetAt(text, position) {
  const lines = text.split("\n");
  let offset = 0;
  for (let line = 0; line < position.line && line < lines.length; line += 1)
    offset += lines[line].length + 1;
  return offset + position.character;
}

export function requestRegion(context) {
  if (!context?.text || !context?.position) return "unknown";
  return regionAt(context.text, offsetAt(context.text, context.position));
}

const COMPLETION_POINTERS = [
  [
    /\/commitCharacters:(extra|missing)-rsvelte-field/,
    (difference) => `completion-commit-characters-presence${directionSuffix(difference)}`,
  ],
  [/\/commitCharacters(:|$)/, commitCharacterValueLabel],
  [/\/command(:|$)/, completionCommandLabel],
  [/\/(textEdit|additionalTextEdits)(\/|:|$)/, completionTextEditLabel],
  [/\/data(\/|:|$)/, completionItemDataLabel],
  [/^\/isIncomplete:/, "completion-is-incomplete"],
  [/\/(detail|documentation|labelDetails)(\/|:|$)/, completionItemDetailLabel],
];

// Which provider produced a completion item, read off the item itself: the TS
// server is the only one that attaches `data`, and the language-data providers
// cite MDN. A close tag is its own mechanism (rsvelte has no `</` path at all),
// and its label spelling is the one thing that separates it from an open tag.
function completionProvider(item, region) {
  if (item?.data !== undefined) return "ts";
  // Emmet names itself, and nothing else about the item does: an abbreviation
  // carries no `kind` and no MDN prose, so the region would read it as html.
  if (item?.detail === "Emmet Abbreviation") return "emmet";
  if (typeof item?.label === "string" && item.label.startsWith("/"))
    return "html-close-tag";
  const documentation =
    typeof item?.documentation === "string"
      ? item.documentation
      : (item?.documentation?.value ?? "");
  // Only the `MDN Reference:` line names the item's own area. The HTML `class`
  // attribute's prose links to `/docs/Web/CSS/Class_selectors`, so a bare
  // substring test reads it as CSS.
  const reference = /^MDN Reference: https:\/\/developer\.mozilla\.org\/docs\/Web\/(CSS|HTML|SVG)\//m.exec(
    documentation,
  );
  if (reference) return reference[1].toLowerCase();
  if (region === "style") return "css";
  if (region === "markup") return "html";
  return "other";
}

const completionItems = (value) =>
  Array.isArray(value?.items) ? value.items : Array.isArray(value) ? value : [];

function classifyCompletionItemSet(official, rsvelte, difference, region) {
  const direction = difference.includes(":missing-rsvelte") ? "missing" : "extra";
  const officialItems = completionItems(official);
  const rsvelteItems = completionItems(rsvelte);
  const otherSide = new Set(
    (direction === "missing" ? rsvelteItems : officialItems).map((item) => item?.label),
  );
  const differing = (direction === "missing" ? officialItems : rsvelteItems).filter(
    (item) => !otherSide.has(item?.label),
  );
  // No label is missing: the arrays differ because an item is unpaired on a
  // pairing-key field, and then NONE of that item's other fields is compared.
  if (differing.length === 0)
    return classifyPairingKey(officialItems, rsvelteItems, region);
  return `completion-item-set-${direction}-${providerOf(differing, region)}`;
}

// Direction is deliberately absent: one unpaired item produces a `missing` and
// an `extra` pointer from the same cause, so a directional label would count
// one mechanism twice under two names.
function providerOf(items, region) {
  const providers = new Set(items.map((item) => completionProvider(item, region)));
  return providers.size === 1 ? [...providers][0] : providers.size === 0 ? "other" : "mixed";
}

function classifyPairingKey(officialItems, rsvelteItems, region) {
  const byLabel = new Map();
  for (const item of officialItems)
    if (item?.label !== undefined && !byLabel.has(item.label))
      byLabel.set(item.label, item);
  const fields = new Set();
  const differing = [];
  for (const item of rsvelteItems) {
    const match = byLabel.get(item?.label);
    if (!match) continue;
    let differs = false;
    for (const field of PAIRING_KEY_FIELDS)
      if (
        JSON.stringify(match[field] ?? null) !== JSON.stringify(item[field] ?? null)
      ) {
        fields.add(field);
        differs = true;
      }
    // The OFFICIAL item, because `completionProvider` reads `data` and the
    // language-data prose, and rsvelte is the side that may have dropped them.
    if (differs) differing.push(match);
  }
  if (fields.size === 0) return "completion-item-duplicate-label";
  const suffix = PAIRING_KEY_FIELDS.filter((field) => fields.has(field))
    .map((field) => PAIRING_KEY_SLUG[field])
    .join("+");
  return `completion-item-pairing-key-${suffix}-${providerOf(differing, region)}`;
}

// The `@`-segment of a pointer is `identity()` of the item, so the item it
// names can be recovered on both sides rather than guessed from the response.
// The index is memoised per payload: one response carries thousands of items
// and thousands of differences, and hashing the items per difference is
// quadratic in a place where the run never finishes.
const itemIndex = new WeakMap();
function itemsByIdentity(payload) {
  if (payload === null || typeof payload !== "object") return undefined;
  let index = itemIndex.get(payload);
  if (index) return index;
  index = new Map();
  for (const item of completionItems(payload)) {
    const key = identity("textDocument/completion", "/items", item);
    if (!index.has(key)) index.set(key, item);
  }
  itemIndex.set(payload, index);
  return index;
}

function itemAtPointer(payload, difference) {
  const match = /\/items\/@([^/:]+)/.exec(difference);
  if (!match) return undefined;
  return itemsByIdentity(payload)?.get(match[1]);
}

// Upstream appends `(` only at a call location and otherwise passes TypeScript's
// list through; rsvelte synthesizes one list for every item. The two failures
// look the same in the pointer and are different mechanisms: one adds a
// character to the same base, the other has a different base.
function commitCharacterValueLabel(difference, official, rsvelte) {
  const left = itemAtPointer(official, difference)?.commitCharacters;
  const right = itemAtPointer(rsvelte, difference)?.commitCharacters;
  if (!Array.isArray(left) || !Array.isArray(right))
    return "completion-commit-characters-value-other";
  const extra = right.filter((character) => !left.includes(character));
  const missing = left.filter((character) => !right.includes(character));
  return missing.length === 0 && extra.length === 1 && extra[0] === "("
    ? "completion-commit-characters-value-extra-paren"
    : "completion-commit-characters-value-other";
}

// A presence divergence has a free direction and the pointer does not carry it,
// so one label would cover "rsvelte writes a field upstream omits" and its
// opposite. A ratchet entry suppresses everything its key cannot tell apart.
function directionSuffix(difference) {
  if (/:extra-rsvelte-field/.test(difference)) return "-rsvelte-only";
  if (/:missing-rsvelte-field/.test(difference)) return "-official-only";
  return "-rsvelte-only";
}

function completionCommandLabel(difference) {
  return /\/command:(extra|missing)-rsvelte-field/.test(difference)
    ? `completion-command-presence${directionSuffix(difference)}`
    : "completion-command-value";
}

function completionItemDetailLabel(difference) {
  const match = /\/(detail|documentation|labelDetails)(:(extra|missing)-rsvelte-field)?/.exec(
    difference,
  );
  const field = match[1] === "labelDetails" ? "label-details" : match[1];
  return match[2]
    ? `completion-item-${field}-presence${directionSuffix(difference)}`
    : `completion-item-${field}-value`;
}

// `textEdit` and `additionalTextEdits` are separate fields with separate
// producers, and a range's two endpoints move independently -- a shift and a
// length change are one key only while both endpoints share a label.
// The `@completion-<hash>` segment names one item; `diff.mjs` exports the digest
// so the provider can be read off the item itself rather than off the region,
// which is only a proxy -- a TypeScript completion inside a `{...}` expression
// sits in markup.
function itemForPointer(difference, official, rsvelte) {
  const named = /\/items\/@(completion-[0-9a-f]+)(\/|:|$)/.exec(difference);
  if (!named) return null;
  for (const side of [rsvelte, official])
    for (const item of completionItems(side))
      if (identity("textDocument/completion", "/items", item) === named[1]) return item;
  return null;
}

function completionTextEditLabel(difference, official, rsvelte, region) {
  const additional = /\/additionalTextEdits(\/|:|$)/.test(difference);
  if (/\/(textEdit|additionalTextEdits):(extra|missing)-rsvelte-field/.test(difference))
    return additional
      ? `completion-additional-text-edits-presence${directionSuffix(difference)}`
      : `completion-text-edit-presence${directionSuffix(difference)}`;
  if (additional) return "completion-additional-text-edits-other";
  if (/\/newText(:|$)/.test(difference)) {
    const item = itemForPointer(difference, official, rsvelte);
    return `completion-text-edit-new-text-${item ? completionProvider(item, region) : "other"}`;
  }
  if (/\/(range|insert|replace)\/start(\/|:|$)/.test(difference))
    return "completion-text-edit-range-start";
  if (/\/(range|insert|replace)\/end(\/|:|$)/.test(difference))
    return "completion-text-edit-range-end";
  if (/\/(range|insert|replace)(\/|:|$)/.test(difference))
    return "completion-text-edit-range-other";
  return "completion-text-edit-other";
}

function completionItemDataLabel(difference) {
  const match = /\/data\/([^/:[]+)/.exec(difference);
  switch (match?.[1]) {
    case "source":
      return `completion-item-data-source${directionSuffix(difference)}`;
    case "uri":
      return "completion-item-data-uri";
    case "position":
      return "completion-item-data-position";
    case "name":
      return "completion-item-data-name";
    default:
      return "completion-item-data-other";
  }
}

function classifyCompletion(official, rsvelte, difference, region) {
  for (const [pattern, label] of COMPLETION_POINTERS)
    if (pattern.test(difference))
      return typeof label === "function"
        ? label(difference, official, rsvelte, region)
        : label;
  if (/^\/items:(extra|missing)-rsvelte/.test(difference))
    return classifyCompletionItemSet(official, rsvelte, difference, region);
  if (isEmptyResult(official?.items) && !isEmptyResult(rsvelte?.items))
    return "official-empty";
  if (!isEmptyResult(official?.items) && isEmptyResult(rsvelte?.items))
    return "rsvelte-empty";
  return UNCLASSIFIED;
}

export function classifyDivergence(method, official, rsvelte, difference, context) {
  let label;
  if (method === "textDocument/hover") label = classifyHover(official, rsvelte);
  else if (method === "textDocument/definition")
    label = classifyDefinition(official, rsvelte, difference, context?.position);
  else if (method === "textDocument/completion")
    label = classifyCompletion(official, rsvelte, difference, requestRegion(context));
  else label = "unclassified";
  // A label outside the vocabulary would silently create ratchet keys nobody
  // can enumerate, so it is a defect in this module rather than a new class.
  if (!MECHANISM_SET.has(label))
    throw new Error(`mechanism "${label}" is not in the declared vocabulary`);
  return label;
}

export function classifyDivergences(method, official, rsvelte, differences, context) {
  const labels = new Set();
  for (const difference of differences)
    labels.add(classifyDivergence(method, official, rsvelte, difference, context));
  return [...labels].sort();
}
