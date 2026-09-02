import test from "node:test";
import assert from "node:assert/strict";
import { MECHANISMS, classifyDivergence, regionAt, offsetAt } from "./mechanism.mjs";
import { identity } from "./diff.mjs";

const hover = (contents) => ({ contents });
const ts = (text) => hover("```typescript\n" + text + "\n```");
const plain = (value) => hover({ kind: "plaintext", value });
const CSS_DOC = plain(
  "The scale CSS property ...\n\nMDN Reference: https://developer.mozilla.org/docs/Web/CSS/scale",
);
const HTML_DOC = plain(
  "The div element ...\n\nMDN Reference: https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/div",
);
const classify = (method, left, right, difference = "/contents:value-mismatch", context) =>
  classifyDivergence(method, left, right, difference, context);

test("every label the classifier can emit is declared", () => {
  assert.equal(new Set(MECHANISMS).size, MECHANISMS.length);
  assert.ok(MECHANISMS.includes("unclassified"));
});

test("hover: the two language-data providers are told apart", () => {
  assert.equal(classify("textDocument/hover", CSS_DOC, plain("`scale` CSS property")), "css-data");
  assert.equal(classify("textDocument/hover", CSS_DOC, null), "css-data");
  assert.equal(classify("textDocument/hover", HTML_DOC, null), "html-data");
});

test("hover: language data on one side and TypeScript on the other is routing", () => {
  assert.equal(classify("textDocument/hover", HTML_DOC, ts("const a: number")), "provider-routing");
  assert.equal(classify("textDocument/hover", ts("const a: number"), HTML_DOC), "provider-routing");
});

test("hover: a different symbol is not a rendering difference", () => {
  assert.equal(
    classify("textDocument/hover", ts("(method) String.replace(): string"), ts("(method) String.replace(x): string")),
    "ts-render",
  );
  assert.equal(
    classify("textDocument/hover", ts("var undefined"), ts("(property) undefined: undefined")),
    "ts-symbol-kind",
  );
  assert.equal(
    classify("textDocument/hover", ts('module "svelte/elements.js"'), ts('module "svelte/elements"')),
    "ts-symbol-name",
  );
});

test("hover: an equal payload leaves only the response range", () => {
  assert.equal(
    classify(
      "textDocument/hover",
      { contents: "```typescript\nconst a: number\n```", range: { start: { line: 1, character: 0 } } },
      { contents: "```typescript\nconst a: number\n```", range: { start: { line: 1, character: 4 } } },
    ),
    "projection-response-range",
  );
});

const link = (uri, line, character) => ({
  targetUri: uri,
  targetRange: { start: { line, character }, end: { line, character } },
  targetSelectionRange: { start: { line, character }, end: { line, character } },
  originSelectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
});

test("definition: the TypeScript lib copy is not a target mismatch", () => {
  assert.equal(
    classify(
      "textDocument/definition",
      [link("file:///nm/typescript/lib/lib.es5.d.ts", 10, 4)],
      [link("file:///nm/native-preview/lib/lib.es5.d.ts", 10, 4)],
      ":extra-rsvelte",
    ),
    "ts-lib-copy",
  );
});

test("definition: a shadow official alone answers about is its own class", () => {
  assert.equal(
    classify(
      "textDocument/definition",
      [link("file:///ws/a.svelte.ts", 3, 1)],
      [link("file:///ws/a.svelte", 3, 1)],
      ":extra-rsvelte",
    ),
    "official-defect-svelte-ts-shadow",
  );
});

test("definition: same file is a position defect, another file is a target defect", () => {
  assert.equal(
    classify("textDocument/definition", [link("file:///ws/a.svelte", 71, 28)], [link("file:///ws/a.svelte", 71, 1)], ":extra-rsvelte"),
    "projection-target-position-workspace",
  );
  // A position inside a `.d.ts` is not the `.svelte` -> `.tsx` projection at all.
  assert.equal(
    classify("textDocument/definition", [link("file:///ws/a.d.ts", 71, 28)], [link("file:///ws/a.d.ts", 71, 1)], ":extra-rsvelte"),
    "projection-target-position-declaration",
  );
  assert.equal(
    classify("textDocument/definition", [link("file:///ws/types.ts", 0, 12)], [link("file:///ws/a.svelte", 71, 1)], ":extra-rsvelte"),
    "target-file-mismatch",
  );
  assert.equal(classify("textDocument/definition", [], [link("file:///ws/a.svelte", 1, 1)], ":extra-rsvelte"), "official-empty");
  assert.equal(classify("textDocument/definition", [link("file:///ws/a.svelte", 1, 1)], [], ":missing-rsvelte"), "rsvelte-empty");
});

test("completion: the field the pointer names decides the label", () => {
  const both = { items: [{ label: "a" }] };
  // Two mechanisms shared one label: rsvelte appending `(` to upstream's own
  // list, and the two lists having different bases. The pointer is identical,
  // so the arrays themselves are what separates them -- and the `@` segment is
  // `diff.mjs`'s own `identity()`, so the item is recovered rather than guessed.
  const parenOfficial = { items: [{ label: "a", commitCharacters: [".", ",", ";"] }] };
  const parenRsvelte = { items: [{ label: "a", commitCharacters: [".", ",", ";", "("] }] };
  const parenPointer = `/items/@${identity("textDocument/completion", "/items", parenOfficial.items[0])}/commitCharacters:extra-rsvelte-element[count=1,hash=x]`;
  assert.equal(
    classify("textDocument/completion", parenOfficial, parenRsvelte, parenPointer),
    "completion-commit-characters-value-extra-paren",
  );
  const baseOfficial = { items: [{ label: "a", commitCharacters: [".", ";"] }] };
  const basePointer = `/items/@${identity("textDocument/completion", "/items", baseOfficial.items[0])}/commitCharacters:extra-rsvelte-element[count=1,hash=x]`;
  assert.equal(
    classify("textDocument/completion", baseOfficial, parenRsvelte, basePointer),
    "completion-commit-characters-value-other",
  );
  // A presence divergence has a free direction the pointer does not carry, so
  // both directions have to reach different labels or one entry suppresses both.
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/commitCharacters:extra-rsvelte-field[hash=x]"),
    "completion-commit-characters-presence-rsvelte-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/commitCharacters:missing-rsvelte-field[hash=x]"),
    "completion-commit-characters-presence-official-only",
  );
  // A `textEdit` and a `data` each carry two mechanisms, and the sub-key is what
  // separates "a field rsvelte never writes" from "a value both sides compute".
  // A range's two endpoints move independently: under one label a shift and a
  // length change are the same key.
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/textEdit/range/end/character:value-mismatch"),
    "completion-text-edit-range-end",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/textEdit/range/start/character:value-mismatch"),
    "completion-text-edit-range-start",
  );
  // `additionalTextEdits` is a different field with a different producer.
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/additionalTextEdits:missing-rsvelte-field[hash=x]"),
    "completion-additional-text-edits-presence-official-only",
  );
  // `detail` and `documentation` reached one label in both directions.
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/detail:extra-rsvelte-field[hash=x]"),
    "completion-item-detail-presence-rsvelte-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/documentation:missing-rsvelte-field[hash=x]"),
    "completion-item-documentation-presence-official-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/labelDetails/description:value-mismatch"),
    "completion-item-label-details-value",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/command:extra-rsvelte-field[hash=x]"),
    "completion-command-presence-rsvelte-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/command:missing-rsvelte-field[hash=x]"),
    "completion-command-presence-official-only",
  );
  // `@x` names no item, so the provider cannot be read and must not be guessed.
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/textEdit/newText:value-mismatch"),
    "completion-text-edit-new-text-other",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/textEdit:extra-rsvelte-field[hash=x]"),
    "completion-text-edit-presence-rsvelte-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/data/source:missing-rsvelte-field[hash=x]"),
    "completion-item-data-source-official-only",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/data/uri:value-mismatch[official=a,rsvelte=b]"),
    "completion-item-data-uri",
  );
  assert.equal(
    classify("textDocument/completion", both, both, "/items/@x/data:missing-rsvelte-field[hash=x]"),
    "completion-item-data-other",
  );
  // A real set difference: the label is on one side only, so the item-set
  // classifier runs. Identical arrays would route to the pairing-key branch.
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [{ label: "a" }, { label: "b" }] },
      both,
      "/items:missing-rsvelte-element[count=1,hash=x]",
    ),
    "completion-item-set-missing-other",
  );
  assert.equal(classify("textDocument/completion", both, both, "/isIncomplete:value-mismatch"), "completion-is-incomplete");
});

const mdn = (area, name) => ({
  kind: "plaintext",
  value: `MDN Reference: https://developer.mozilla.org/docs/Web/${area}/Reference/${name}`,
});

test("completion item set: the provider of the differing items names the mechanism", () => {
  const tagItem = (label) => ({ label, kind: 10, documentation: mdn("HTML", label) });
  const cssItem = (label) => ({ label, kind: 10, documentation: mdn("CSS", label) });
  const tsItem = (label) => ({ label, kind: 6, data: { name: label } });
  const set = (...items) => ({ items });

  // A provider each, missing on the rsvelte side.
  assert.equal(
    classify("textDocument/completion", set(tagItem("nav")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-html",
  );
  assert.equal(
    classify("textDocument/completion", set(cssItem("float")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-css",
  );
  assert.equal(
    classify("textDocument/completion", set(tsItem("Window")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-ts",
  );
  // A close tag carries HTML documentation too, so only the `/` separates it.
  assert.equal(
    classify("textDocument/completion", set(tagItem("/nav")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-html-close-tag",
  );
  // Direction is part of the mechanism: the same item on the other side.
  assert.equal(
    classify("textDocument/completion", set(), set(cssItem("-webkit-alt")), "/items:extra-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-extra-css",
  );
  // Two providers in one difference is its own label, not either one of them.
  assert.equal(
    classify("textDocument/completion", set(tagItem("nav"), tsItem("Window")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-mixed",
  );
  // Emmet names itself in `detail`. Nothing else does: the abbreviation has no
  // `kind` and no MDN prose, so the region alone would file it under html and it
  // would land in `mixed` beside a real tag gap.
  const emmetItem = (label) => ({ label, detail: "Emmet Abbreviation", insertTextFormat: 2 });
  assert.equal(
    classify("textDocument/completion", set(emmetItem("Card.Title>R")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-emmet",
  );
  // The control that makes the marker load-bearing: the same shape without it.
  assert.equal(
    classifyDivergence(
      "textDocument/completion",
      set({ label: "Card.Title>R", insertTextFormat: 2 }),
      set(),
      "/items:missing-rsvelte-element[count=1,hash=x]",
      { text: "<div a></div>\n", position: { line: 0, character: 5 } },
    ),
    "completion-item-set-missing-html",
  );
  // And an emmet item beside a real tag gap is `mixed`, not either one.
  assert.equal(
    classify("textDocument/completion", set(emmetItem("s"), tagItem("nav")), set(), "/items:missing-rsvelte-element[count=1,hash=x]"),
    "completion-item-set-missing-mixed",
  );
});

test("ts-render: each of the four tsgo renderings is its own label", () => {
  const hover = (text) => ({ contents: text });
  const render = (left, right) =>
    classify("textDocument/hover", hover(left), hover(right), "/contents:value-mismatch");
  assert.equal(
    render('const a: "value" | "highlighted"', 'const a: "highlighted" | "value"'),
    "ts-render-union-order",
  );
  assert.equal(
    render('const a: ReturnType<import("svelte").Snippet>', "const a: ReturnType<import('svelte').Snippet>"),
    "ts-render-quote-style",
  );
  assert.equal(
    render("(local function) classes(list: string): string[]", "function classes(list: string): string[]"),
    "ts-render-local-modifier",
  );
  assert.equal(
    render("const flagged: false", "const flagged: false\n\n*@default* — false"),
    "ts-render-jsdoc-tag",
  );
  // Not one of the renderings: the two agree on how to print a type and disagree
  // about which type it is. Naming the shape is not attributing it -- the label
  // says what differs, and the terminal is decided separately.
  assert.equal(render("const controls: Writable<{", "const controls: any"), "ts-type-any");
});

test("definition target: a component import and a declaration file are two mechanisms", () => {
  const at = (uri, line) => ({ uri, range: { start: { line, character: 0 } } });
  assert.equal(
    classify(
      "textDocument/definition",
      [at("file:///ws/components/preview.svelte", 0)],
      [at("file:///ws/previews/SpatialMenu.svelte", 2)],
      ":extra-rsvelte",
    ),
    "target-component-vs-import",
  );
  assert.equal(
    classify(
      "textDocument/definition",
      [at("file:///ws/node_modules/svelte/types/index.d.ts", 1876)],
      [at("file:///ws/node_modules/svelte/src/easing/index.js", 9)],
      ":extra-rsvelte",
    ),
    "target-declaration-vs-source",
  );
});

test("definition: an empty official answer splits on whether rsvelte pointed at the request", () => {
	const link = (startLine, startChar, endLine, endChar) => [
		{
			targetUri: "file:///a.svelte",
			targetSelectionRange: {
				start: { line: startLine, character: startChar },
				end: { line: endLine, character: endChar },
			},
		},
	];
	const at = (line, character) => ({ text: "", position: { line, character } });
	// `{...restProps}` at 14:6 -- rsvelte answers with `restProps` itself.
	assert.equal(
		classifyDivergence("textDocument/definition", [], link(14, 5, 14, 14), ":extra-rsvelte-element[count=1,hash=x]", at(14, 6)),
		"official-empty-target-is-the-request",
	);
	// `type ListItemProps = {` asked at the `type` keyword -- rsvelte answers with
	// the NAME, which does not cover the keyword. The sampled residue is exactly
	// this shape: `type`, `as`, and Svelte's `snippet`.
	assert.equal(
		classifyDivergence("textDocument/definition", [], link(42, 6, 42, 19), ":extra-rsvelte-element[count=1,hash=x]", at(42, 2)),
		"official-empty",
	);
	// With no position the split cannot be made, and must not be guessed.
	assert.equal(
		classifyDivergence("textDocument/definition", [], link(14, 5, 14, 14), ":extra-rsvelte-element[count=1,hash=x]", { text: "" }),
		"official-empty",
	);
});

test("completion new text: the provider comes from the item the pointer names", () => {
	const mdn = (area, name) => ({
		kind: "plaintext",
		value: `MDN Reference: https://developer.mozilla.org/docs/Web/${area}/Reference/Global_attributes/${name}`,
	});
	// The two arms measured on this label: an HTML attribute whose official
	// `newText` carries the `="$1"` snippet, and a module specifier official
	// trims to the part after the word range.
	const attribute = { label: "accesskey", kind: 12, documentation: mdn("HTML", "accesskey") };
	const specifier = { label: "components", kind: 9, data: { name: "components" } };
	const pointerFor = (item) =>
		`/items/@${identity("textDocument/completion", "/items", item)}/textEdit/newText:value-mismatch`;
	const list = (...items) => ({ items });
	assert.equal(
		classifyDivergence(
			"textDocument/completion",
			list(attribute),
			list(attribute),
			pointerFor(attribute),
			{ text: "<div a></div>\n", position: { line: 0, character: 5 } },
		),
		"completion-text-edit-new-text-html",
	);
	// The same request position, a different item: the region is markup for both,
	// so a region-based split would call this one html too.
	assert.equal(
		classifyDivergence(
			"textDocument/completion",
			list(specifier),
			list(specifier),
			pointerFor(specifier),
			{ text: "<div a></div>\n", position: { line: 0, character: 5 } },
		),
		"completion-text-edit-new-text-ts",
	);
});

test("hover: an empty rsvelte answer whose official half is only an import line", () => {
	const ts = (...lines) => ({ contents: ["```typescript", ...lines, "```"].join("\n") });
	// 21 of 23 sampled `rsvelte-empty` hovers are this: official's entire answer
	// is the origin line tsgo drops, so dropping it leaves nothing to send.
	assert.equal(
		classify("textDocument/hover", ts("import NavigationMenu"), null),
		"rsvelte-empty-import-only",
	);
	// One more line and it is not the same thing: tsgo had something to answer
	// with and answered nothing anyway.
	assert.equal(
		classify("textDocument/hover", ts('(alias) const Example: Component<{}, {}, "">', "import Example"), null),
		"rsvelte-empty",
	);
	// And a declaration that merely mentions an import is not an import line.
	assert.equal(
		classify("textDocument/hover", ts("const imported: number"), null),
		"rsvelte-empty",
	);
});

test("ts render: a rewrite names the mechanism only when it is the only one that fits", () => {
	const hover = (contents) => ({ contents });
	const ts = (...lines) => hover(["```typescript", ...lines, "```"].join("\n"));

	// tsc names the import a symbol came through; tsgo omits the line.
	assert.equal(
		classify(
			"textDocument/hover",
			ts("(alias) type SelectGroupProps = any", "import SelectGroupProps"),
			ts("(alias) type SelectGroupProps = any"),
		),
		"ts-render-import-line",
	);
	// tsc counts the overloads it did not print.
	assert.equal(
		classify(
			"textDocument/hover",
			ts("function $state<false>(initial: false): false (+1 overload)"),
			ts("function $state<false>(initial: false): false"),
		),
		"ts-render-overload-count",
	);
	// Both at once. This is the order-freeness control: under a first-match loop
	// this input took whichever label sat higher in the table, so the ratchet key
	// depended on the order the rules happened to be written in.
	const compound = () =>
		classify(
			"textDocument/hover",
			ts("(method) Array.from<unknown>(): unknown[] (+3 overloads)", "import Array"),
			ts("(method) Array.from<unknown>(): unknown[]"),
		);
	assert.equal(compound(), "ts-render-multiple");
	// Neither constituent label may claim it.
	for (const label of ["ts-render-overload-count", "ts-render-import-line"])
		assert.notEqual(compound(), label);
	// A merged symbol prints one line per declaration and the two disagree on the
	// order. `svelte/types/index.d.ts` declares every rune as a function plus a
	// namespace, so this reaches a hover on `$props` in any component.
	assert.equal(
		classify(
			"textDocument/hover",
			ts("namespace $props", "function $props(): any"),
			ts("function $props(): any", "namespace $props"),
		),
		"ts-render-declaration-order",
	);
	// Only the fenced block is sorted: prose below it cannot be reordered into
	// equality, or two different explanations would read as one mechanism.
	assert.equal(
		classify(
			"textDocument/hover",
			hover(ts("namespace $props").contents + "\n---\nalpha\nbeta"),
			hover(ts("namespace $props").contents + "\n---\nbeta\nalpha"),
		),
		"ts-render",
	);
	// The same declaration with the type erased is not a rendering difference.
	assert.equal(
		classify(
			"textDocument/hover",
			ts("let className: ClassValue | null | undefined"),
			ts("let className: any"),
		),
		"ts-type-any",
	);
	// The control that keeps `ts-type-any` from swallowing a different symbol:
	// the name differs too, so no rewrite and no `any` rule may claim it.
	assert.equal(
		classify("textDocument/hover", ts("let className: any"), ts("let other: any")),
		"ts-symbol-name",
	);
});

test("region: the boundary is the outside edge of both tags", () => {
  const text = '<div a></div>\n<style>\n  a { }\n</style>\n<script>\n  let x;\n</script>\n';
  const at = (line, character) => regionAt(text, offsetAt(text, { line, character }));
  assert.equal(at(0, 5), "markup");
  assert.equal(at(2, 4), "style");
  assert.equal(at(5, 7), "script");
  // Inside `<style` the region has not been entered yet, and inside `</style`
  // it has not been left: the same rule read from both sides.
  assert.equal(at(1, 3), "markup");
  assert.equal(at(3, 2), "style");
});

test("completion item set: the same MDN-less item is css in a style block and html in markup", () => {
  // `initial` and `data-` cite no MDN page, so nothing on the item itself can
  // attribute them -- only where the request was made.
  const official = { items: [{ label: "initial", kind: 12 }] };
  const rsvelte = { items: [] };
  const difference = "/items:missing-rsvelte[count=1,hash=0]";
  const text = '<div a></div>\n<style>\n  a { color: i }\n</style>\n';
  const inStyle = classifyDivergence("textDocument/completion", official, rsvelte, difference, {
    text,
    position: { line: 2, character: 13 },
  });
  const inMarkup = classifyDivergence("textDocument/completion", official, rsvelte, difference, {
    text,
    position: { line: 0, character: 6 },
  });
  assert.equal(inStyle, "completion-item-set-missing-css");
  assert.equal(inMarkup, "completion-item-set-missing-html");
  // Without the context the axis is unavailable, and the item stays in the
  // residual class -- which is what the arm before this one measured.
  assert.equal(
    classifyDivergence("textDocument/completion", official, rsvelte, difference),
    "completion-item-set-missing-other",
  );
});

test("hover: an empty rsvelte answer splits on whether official hovered the shadow", () => {
  const ts = (text) => ({ contents: "```typescript\n" + text + "\n```" });
  // official hovers svelte2tsx's own synthesized function, which exists in no
  // editor the user has open.
  assert.equal(
    classify("textDocument/hover", ts("function $$render(): { props: $$ComponentProps; }"), null),
    "official-defect-svelte-ts-shadow",
  );
  // The same `$$` appears in a real symbol's TYPE, and that hover is about the
  // user's own declaration -- a text-wide `$$` test would take both.
  assert.equal(
    classify("textDocument/hover", ts('(alias) const Example: Component<$$ComponentProps, {}, "">'), null),
    "rsvelte-empty",
  );
  // An import-only body is its own label: the shadow test must not claim it.
  assert.equal(
    classify("textDocument/hover", ts("import RadioGroup"), null),
    "rsvelte-empty-import-only",
  );
});

test("completion: a label on both sides with a differing pairing-key field is its own mechanism", () => {
  const pointer = "/items:missing-rsvelte-element[count=1,hash=x]";
  // `diff.mjs` never pairs these two, so the arrays differ while the label sets
  // agree -- and none of the item's other fields is ever compared.
  // The provider is part of the key: a TypeScript item's `kind` is the recorded
  // tsgo divergence and an HTML tag's `kind` is rsvelte's own defect, and one
  // label cannot carry both terminals.
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [{ label: "name", kind: 21, sortText: "16", data: { name: "name" } }] },
      { items: [{ label: "name", kind: 6, sortText: "16", data: { name: "name" } }] },
      pointer,
    ),
    "completion-item-pairing-key-kind-ts",
  );
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [{ label: "hr", kind: 6 }] },
      { items: [{ label: "hr", kind: 10 }] },
      pointer,
      { text: "<div></div>", position: { line: 0, character: 5 } },
    ),
    "completion-item-pairing-key-kind-html",
  );
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [{ label: "name", kind: 21, sortText: "z16", data: { name: "name" } }] },
      { items: [{ label: "name", kind: 6, sortText: "16", data: { name: "name" } }] },
      pointer,
    ),
    "completion-item-pairing-key-kind+sort-text-ts",
  );
  // Same key on every shared label: the arrays can then only differ by how many
  // times a label appears.
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [{ label: "name", kind: 6 }, { label: "name", kind: 6 }] },
      { items: [{ label: "name", kind: 6 }] },
      pointer,
    ),
    "completion-item-duplicate-label",
  );
});

test("completion item set: an HTML attribute whose prose links to CSS is still html", () => {
  // Real documentation for the `class` attribute: the body cites
  // `/docs/Web/CSS/Class_selectors` and only the reference line names its area.
  const documentation = [
    "A space-separated list of the classes of the element. Classes allows CSS and",
    "JavaScript to select and access specific elements via the",
    "[class selectors](https://developer.mozilla.org/docs/Web/CSS/Class_selectors).",
    "",
    "MDN Reference: https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/class",
  ].join("\n");
  assert.equal(
    classify(
      "textDocument/completion",
      { items: [] },
      { items: [{ label: "class", kind: 12, documentation: { kind: "plaintext", value: documentation } }] },
      "/items:extra-rsvelte-element[count=1,hash=x]",
    ),
    "completion-item-set-extra-html",
  );
});
