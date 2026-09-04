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

const at = (line, character) => ({ line, character });
const diag = (over) => ({
  code: 2304,
  source: "ts",
  severity: 1,
  message: "Cannot find name 'a'.",
  range: { start: at(1, 4), end: at(1, 5) },
  ...over,
});
const report = (...items) => ({ kind: "full", items });
const MISSING = ":missing-rsvelte-element[count=1,hash=x]";
const EXTRA = ":extra-rsvelte-element[count=1,hash=x]";

test("diagnostic: one problem under two spellings is a renaming, not a set difference", () => {
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(diag({ source: "ts" })),
      report(diag({ source: "js" })),
      "/items" + MISSING,
    ),
    "diagnostic-identity-source",
  );
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(diag({ code: "parse-error" })),
      report(diag({ code: "js_parse_error" })),
      "/items" + MISSING,
    ),
    "diagnostic-identity-code",
  );
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(diag({ source: "css", code: "unknownProperties" })),
      report(diag({ source: "rsvelte-css", code: "css_unknown_property" })),
      "/items" + MISSING,
    ),
    "diagnostic-identity-source-and-code",
  );
});

test("diagnostic: a problem with no twin at its own position is a set difference", () => {
  // The negative side of the renaming rule: same payload, moved so that nothing
  // on the other side shares its position, and the label has to change.
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(diag({ source: "ts", range: { start: at(9, 0), end: at(9, 1) } })),
      report(diag({ source: "js" })),
      "/items" + MISSING,
    ),
    "diagnostic-item-set-missing-ts",
  );
  assert.equal(
    classify("textDocument/diagnostic", report(), report(diag({ source: "svelte" })), "/items" + EXTRA),
    "diagnostic-item-set-extra-svelte",
  );
});

test("diagnostic: two producers in one response do not inherit the first one's label", () => {
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(
        diag({ source: "ts", range: { start: at(9, 0), end: at(9, 1) } }),
        diag({ source: "svelte", range: { start: at(8, 0), end: at(8, 1) } }),
      ),
      report(),
      "/items" + MISSING,
    ),
    "diagnostic-item-set-missing-mixed",
  );
  // A renaming beside a set difference is neither of them.
  assert.equal(
    classify(
      "textDocument/diagnostic",
      report(diag({ source: "ts" }), diag({ source: "ts", range: { start: at(9, 0), end: at(9, 1) } })),
      report(diag({ source: "js" })),
      "/items" + MISSING,
    ),
    "diagnostic-mixed",
  );
});

test("diagnostic: a paired problem differing in one field names the field", () => {
  const both = report(diag());
  assert.equal(
    classify("textDocument/diagnostic", both, both, "/items/@diagnostic-abc/range/end/character:value-mismatch"),
    "diagnostic-item-range-end",
  );
  assert.equal(
    classify("textDocument/diagnostic", both, both, "/items/@diagnostic-abc/range/start/line:value-mismatch"),
    "diagnostic-item-range-start",
  );
  assert.equal(
    classify("textDocument/diagnostic", both, both, "/items/@diagnostic-abc/message:value-mismatch"),
    "diagnostic-item-message",
  );
  assert.equal(
    classify("textDocument/diagnostic", both, both, "/items/@diagnostic-abc/tags:value-mismatch"),
    "diagnostic-item-other",
  );
});

const sym = (name, kind, line, children) => ({
  name,
  kind,
  range: { start: at(line, 0), end: at(line, 9) },
  selectionRange: { start: at(line, 0), end: at(line, 1) },
  ...(children ? { children } : {}),
});

test("documentSymbol: a symbol both sides report with a different kind is not a set difference", () => {
  assert.equal(
    classify("textDocument/documentSymbol", [sym("style", 8, 0)], [sym("style", 2, 0)], MISSING),
    "document-symbol-kind",
  );
  assert.equal(
    classify("textDocument/documentSymbol", [sym("style", 8, 0)], [sym("style", 8, 3)], MISSING),
    "document-symbol-range",
  );
  assert.equal(
    classify("textDocument/documentSymbol", [sym("style", 8, 0), sym("h1", 5, 1)], [sym("style", 8, 0)], MISSING),
    "document-symbol-set-missing",
  );
  // Two mechanisms in one response are named by the parts they hold, with the
  // set difference keeping its direction: a bare `mixed` would suppress the four
  // combinations the corpus carries.
  assert.equal(
    classify("textDocument/documentSymbol", [sym("style", 8, 0), sym("h1", 5, 1)], [sym("style", 2, 0)], MISSING),
    "document-symbol-mixed-kind-set-missing",
  );
  // A node contributes its first differing part only, so three parts need three
  // nodes: one whose kind moved, one whose range moved, one with no twin.
  assert.equal(
    classify(
      "textDocument/documentSymbol",
      [sym("style", 8, 0), sym("h1", 5, 1)],
      [sym("style", 2, 0), sym("h1", 5, 4), sym("body", 1, 5)],
      EXTRA,
    ),
    "document-symbol-mixed-kind-range-set-extra",
  );
  assert.equal(
    classify(
      "textDocument/documentSymbol",
      [sym("style", 8, 0), sym("h1", 5, 1)],
      [sym("style", 8, 3)],
      MISSING,
    ),
    "document-symbol-mixed-range-set-missing",
  );
});

test("documentSymbol: a nested symbol is matched by name, not by its depth", () => {
  // Without flattening, `h1` is invisible on the right and reads as a set
  // difference; the two sides disagree only about its kind.
  assert.equal(
    classify(
      "textDocument/documentSymbol",
      [sym("body", 8, 0, [sym("h1", 5, 1)])],
      [sym("body", 8, 0, [sym("h1", 12, 1)])],
      MISSING,
    ),
    "document-symbol-kind",
  );
});

const fold = (startLine, over) => ({
  startLine,
  startCharacter: 0,
  endLine: startLine + 2,
  endCharacter: 4,
  ...over,
});

test("foldingRange: a fold that starts on the same line is not one the other side lacks", () => {
  assert.equal(
    classify("textDocument/foldingRange", [fold(0)], [fold(0, { endLine: 5 })], MISSING),
    "folding-range-end-line",
  );
  assert.equal(
    classify("textDocument/foldingRange", [fold(0)], [fold(0, { startCharacter: 2 })], MISSING),
    "folding-range-character",
  );
  assert.equal(
    classify("textDocument/foldingRange", [fold(0)], [fold(0, { kind: "region" })], MISSING),
    "folding-range-kind",
  );
  assert.equal(classify("textDocument/foldingRange", [fold(0)], [fold(7)], MISSING), "folding-range-set-missing");
  assert.equal(classify("textDocument/foldingRange", [], [fold(7)], EXTRA), "folding-range-set-extra");
  assert.equal(
    classify("textDocument/foldingRange", [fold(0), fold(7)], [fold(0, { endLine: 5 })], MISSING),
    "folding-range-mixed-end-line-set-missing",
  );
  assert.equal(
    classify(
      "textDocument/foldingRange",
      [fold(0), fold(3)],
      [fold(0, { startCharacter: 2 }), fold(3, { kind: "region" })],
      MISSING,
    ),
    "folding-range-mixed-character-kind",
  );
});

const hint = (line, over) => ({ position: at(line, 4), kind: 1, label: ": number", ...over });

test("inlayHint: the hint kind is in the set-difference label, and a paired hint is not one", () => {
  assert.equal(classify("textDocument/inlayHint", [], [hint(0)], EXTRA), "inlay-hint-set-extra-type");
  assert.equal(
    classify("textDocument/inlayHint", [], [hint(0, { kind: 2 })], EXTRA),
    "inlay-hint-set-extra-parameter",
  );
  assert.equal(classify("textDocument/inlayHint", [hint(0)], [], MISSING), "inlay-hint-set-missing-type");
  assert.equal(
    classify("textDocument/inlayHint", [hint(0)], [hint(0, { label: ": string" })], MISSING),
    "inlay-hint-label",
  );
  assert.equal(classify("textDocument/inlayHint", [hint(0)], [hint(0, { kind: 2 })], MISSING), "inlay-hint-kind");
  assert.equal(
    classify("textDocument/inlayHint", [hint(0), hint(7)], [hint(0, { label: ": string" })], MISSING),
    "inlay-hint-mixed",
  );
  // Hints of two kinds that neither side pairs are one mechanism per direction:
  // `inlay-hint-mixed` is the case where a paired hint also disagrees.
  assert.equal(
    classify("textDocument/inlayHint", [], [hint(0), hint(7, { kind: 2 })], EXTRA),
    "inlay-hint-set-extra-mixed",
  );
  assert.equal(
    classify("textDocument/inlayHint", [hint(0), hint(7, { kind: 2 })], [], MISSING),
    "inlay-hint-set-missing-mixed",
  );
});

test("an empty side is the same answer however it is spelled", () => {
  assert.equal(classify("textDocument/inlayHint", null, [], "/:value-mismatch"), "empty-result-spelling");
  assert.equal(classify("textDocument/inlayHint", null, [hint(0)], "/:value-mismatch"), "official-empty");
  assert.equal(classify("textDocument/inlayHint", [hint(0)], null, "/:value-mismatch"), "rsvelte-empty");
  // A method with no rules of its own reaches the same test through an element
  // difference rather than a value mismatch.
  assert.equal(
    classify(
      "textDocument/formatting",
      [{ newText: "unformatted\n", range: { start: at(0, 0), end: at(0, 11) } }],
      [],
      MISSING,
    ),
    "rsvelte-empty",
  );
  assert.equal(classify("textDocument/codeAction", [], [{ kind: "quickfix", title: "x" }], EXTRA), "official-empty");
});

const chain = (...ranges) =>
  ranges.reduce((parent, range) => (parent ? { range, parent } : { range }), undefined);
const span = (a, b) => ({ start: at(0, a), end: at(0, b) });

test("selectionRange: the chain's depth and its innermost range are two mechanisms", () => {
  const officialChain = chain(span(0, 21), span(4, 15), span(11, 14));
  const deeper = chain(span(0, 21), span(0, 16), span(4, 15), span(11, 14));
  assert.equal(
    classify("textDocument/selectionRange", [officialChain], [deeper], EXTRA),
    "selection-range-chain-rsvelte-deeper",
  );
  assert.equal(
    classify("textDocument/selectionRange", [deeper], [officialChain], MISSING),
    "selection-range-chain-rsvelte-shallower",
  );
  assert.equal(
    classify("textDocument/selectionRange", [officialChain], [chain(span(0, 21), span(4, 15), span(11, 13))], MISSING),
    "selection-range-innermost",
  );
  // The negative side: an identical chain has no depth difference to report.
  assert.equal(classify("textDocument/selectionRange", [officialChain], [officialChain], MISSING), "unclassified");
});

test("linkedEditingRange: the word pattern is its own mechanism", () => {
  const ranges = [{ start: at(0, 1), end: at(0, 4) }];
  assert.equal(
    classify(
      "textDocument/linkedEditingRange",
      { ranges, wordPattern: "(-?\\d*\\.\\d\\w*)|([^\\s]+)" },
      { ranges, wordPattern: "[-_:A-Za-z0-9$]+" },
      "/wordPattern:value-mismatch",
    ),
    "linked-editing-word-pattern",
  );
  assert.equal(
    classify(
      "textDocument/linkedEditingRange",
      { ranges, wordPattern: "x" },
      { ranges: [{ start: at(0, 2), end: at(0, 4) }], wordPattern: "x" },
      "/ranges:missing-rsvelte-element[count=1,hash=x]",
    ),
    "unclassified",
  );
});

test("initialize: each advertised capability is its own decision", () => {
  const caps = (over) => ({ capabilities: { ...over } });
  assert.equal(
    classify(
      "initialize",
      caps({ completionProvider: { triggerCharacters: [".", " "] } }),
      caps({ completionProvider: { triggerCharacters: ["."] } }),
      "/capabilities/completionProvider/triggerCharacters:missing-rsvelte-element[count=1,hash=x]",
    ),
    "initialize-capability-completionProvider",
  );
  assert.equal(
    classify(
      "initialize",
      caps({ semanticTokensProvider: { legend: { tokenTypes: ["class"] } } }),
      caps({ semanticTokensProvider: { legend: { tokenTypes: [] } } }),
      "/capabilities/semanticTokensProvider/legend/tokenTypes:missing-rsvelte-element[count=1,hash=x]",
    ),
    "initialize-capability-semanticTokensProvider",
  );
  // A capability nobody has enumerated must not be filed under one that is.
  assert.equal(
    classify(
      "initialize",
      caps({ inlineCompletionProvider: true }),
      caps({ inlineCompletionProvider: false }),
      "/capabilities/inlineCompletionProvider:value-mismatch",
    ),
    "initialize-capability-other",
  );
});

// A declared label the rules cannot return is vocabulary that only ever throws
// on the day its input arrives. These four families are hand-written cross
// products, so each declared member is constructed from its own suffix and the
// classifier has to return it: a member with no construction fails here.
test("every declared label in a hand-written cross product is reachable", () => {
  const declared = (re) => MECHANISMS.map((label) => re.exec(label)).filter(Boolean);
  const seen = [];

  for (const [label, direction, source] of declared(/^diagnostic-item-set-(missing|extra)-(.+)$/)) {
    const items =
      source === "mixed"
        ? [diag({ source: "ts" }), diag({ source: "svelte", range: { start: at(2, 0), end: at(2, 1) } })]
        : [diag({ source: source === "other" ? "eslint" : source })];
    const [left, right] = direction === "missing" ? [report(...items), report()] : [report(), report(...items)];
    assert.equal(
      classify("textDocument/diagnostic", left, right, "/items" + (direction === "missing" ? MISSING : EXTRA)),
      label,
    );
    seen.push(label);
  }

  const HINT_KIND = { type: 1, parameter: 2, other: 7 };
  for (const [label, direction, kind] of declared(/^inlay-hint-set-(missing|extra)-(.+)$/)) {
    const hints =
      kind === "mixed" ? [hint(0, { kind: 1 }), hint(7, { kind: 2 })] : [hint(0, { kind: HINT_KIND[kind] })];
    const [left, right] = direction === "missing" ? [hints, []] : [[], hints];
    assert.equal(
      classify("textDocument/inlayHint", left, right, direction === "missing" ? MISSING : EXTRA),
      label,
    );
    seen.push(label);
  }

  for (const [label, capability] of declared(/^initialize-capability-(.+)$/)) {
    const name = capability === "other" ? "inlineCompletionProvider" : capability;
    assert.equal(
      classify(
        "initialize",
        { capabilities: { [name]: true } },
        { capabilities: { [name]: false } },
        `/capabilities/${name}:value-mismatch`,
      ),
      label,
    );
    seen.push(label);
  }

  const FIELD_POINTER = {
    "range-start": "range/start/line",
    "range-end": "range/end/character",
    message: "message",
    severity: "severity",
    other: "tags",
  };
  for (const [label, field] of declared(/^diagnostic-item-((?!set-).+)$/)) {
    const both = report(diag());
    assert.equal(
      classify("textDocument/diagnostic", both, both, `/items/@diagnostic-abc/${FIELD_POINTER[field]}:value-mismatch`),
      label,
    );
    seen.push(label);
  }

  // The loops must have run: an empty match set would assert nothing at all.
  assert.equal(seen.length, new Set(seen).size);
  assert.ok(seen.length >= 16 + 8 + 8 + 5, `only ${seen.length} labels were constructed`);
});

// A combination label is generated by the same function the classifier calls, so a
// generator whose domain is wider than the classifier's would declare a label no
// input can produce. Equality in both directions is what says the two agree.
test("every declared combination label is produced by some input, and no other is", () => {
  const PART = {
    "textDocument/documentSymbol": {
      order: ["kind", "range"],
      kind: [sym("dk", 8, 0), sym("dk", 2, 0)],
      range: [sym("dr", 12, 1), sym("dr", 12, 3)],
      set: [sym("ds", 12, 5), null],
    },
    "textDocument/foldingRange": {
      order: ["end-line", "character", "kind"],
      "end-line": [fold(0), fold(0, { endLine: 5 })],
      character: [fold(10, { startCharacter: 1 }), fold(10, { startCharacter: 2 })],
      kind: [fold(20, { kind: "comment" }), fold(20, { kind: "region" })],
      set: [fold(30), null],
    },
  };
  const subsets = (list) => list.reduce((acc, x) => acc.concat(acc.map((s) => [...s, x])), [[]]);

  const produced = new Set();
  for (const [method, table] of Object.entries(PART)) {
    for (const fields of subsets(table.order)) {
      for (const tail of [[], ["set"]]) {
        const chosen = [...fields, ...tail];
        if (chosen.length === 0) continue;
        const mine = chosen.map((part) => table[part][0]);
        const other = chosen.map((part) => table[part][1]).filter(Boolean);
        for (const direction of ["missing", "extra"]) {
          const [left, right] = direction === "missing" ? [mine, other] : [other, mine];
          produced.add(classify(method, left, right, direction === "missing" ? MISSING : EXTRA));
        }
      }
    }
  }

  const combinations = (labels) => [...labels].filter((label) => label.includes("-mixed-")).sort();
  assert.ok(combinations(MECHANISMS).length > 0);
  assert.deepEqual(combinations(produced), combinations(MECHANISMS));
});
