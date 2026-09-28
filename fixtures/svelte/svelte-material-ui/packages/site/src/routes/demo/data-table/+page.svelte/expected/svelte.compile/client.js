import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import ProgressIndicator from './_ProgressIndicator.svelte';
import StickyHeader from './_StickyHeader.svelte';
import RowSelection from './_RowSelection.svelte';
import Pagination from './_Pagination.svelte';
import Sortable from './_Sortable.svelte';

var root = $.from_html(`<section><h2>Data Table</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/data-table</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1wihlh0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Data Table - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'data-table/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return ProgressIndicator;
		},
		file: 'data-table/_ProgressIndicator.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Progress indicator');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_1 = $.text('This is displayed in an iframe and the source viewer shows the iframe\n      source. Sticky headers don\'t work if any ancestor element has the\n      "overflow" style set to "hidden", "scroll", or "auto".');

			$.append($$anchor, text_1);
		};

		Demo(node_2, {
			get component() {
				return StickyHeader;
			},
			file: 'data-table/iframe/+page.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Sticky header');

				$.append($$anchor, text_2);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return RowSelection;
		},
		file: 'data-table/_RowSelection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Row selection');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Pagination;
		},
		file: 'data-table/_Pagination.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Pagination');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Sortable;
		},
		file: 'data-table/_Sortable.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Sortable');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}