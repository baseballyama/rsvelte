import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowRight, ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Starter Kit`, 1);
var root_1 = $.from_html(`Tasks Extension <!>`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Tables Extension</h1> <p class="lead">Add rich, interactive tables into your documents with rows, columns, headers, and full keyboard
		navigation.</p> <hr class="my-6"/> <h2>Usage</h2> <p>The Table suite consists of <code>Table</code>, <code>TableRow</code>, <code>TableHeader</code>,
		and <code>TableCell</code> extensions. Edra integrates these custom extensions directly into its default
		configuration.</p> <div class="my-4"><!></div> <h2>Keyboard Shortcuts & Commands</h2> <p>The table extension supports intuitive keyboard navigation and a set of command chains to
		programmatically alter table layout:</p> <ul class="mt-4 list-disc space-y-2 pl-6"><li><code>insertTable(&#123; rows, cols, withHeaderRow &#125;)</code>: Inserts a new table at the
			current cursor position.</li> <li><code>addColumnBefore() / addColumnAfter()</code>: Adds a column to the left or right of the
			active cell.</li> <li><code>deleteColumn()</code>: Removes the current column.</li> <li><code>addRowBefore() / addRowAfter()</code>: Adds a row above or below the active cell.</li> <li><code>deleteRow()</code>: Removes the current row.</li> <li><code>deleteTable()</code>: Removes the entire table.</li></ul> <h2>Styling</h2> <p>Edra applies custom borders, spacing, and header styling inside <code>editor.css</code> so that tables
		match your theme out of the box (with horizontal borders, row highlights, and clean padding).</p> <div class="mt-12 flex justify-between"><!> <!></div></article>`);

export default function _page($$anchor) {
	const tableSnippet = `import { Table, TableRow, TableHeader, TableCell } from '$lib/edra/tiptap/index.js';

// Table extensions are included in the default extensions list.
// Inside your code, you can run commands on the editor instance:
editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();`;

	var article = root_2();

	$.head('1e8qtgz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tables | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 10);
	var node = $.child(div);

	Code(node, { code: tableSnippet, language: 'typescript' });
	$.reset(div);

	var div_1 = $.sibling(div, 12);
	var node_1 = $.child(div_1);

	Button(node_1, {
		href: '/docs/extensions/starter-kit',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			ArrowLeft(node_2, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		href: '/docs/extensions/tasks',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();
			var node_4 = $.sibling($.first_child(fragment_1));

			ArrowRight(node_4, { class: 'size-4' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(article);
	$.append($$anchor, article);
}