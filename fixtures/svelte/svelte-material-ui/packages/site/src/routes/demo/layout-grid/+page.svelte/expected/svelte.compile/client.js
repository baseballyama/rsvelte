import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Span from './_Span.svelte';
import Order from './_Order.svelte';
import FixedColumnWidth from './_FixedColumnWidth.svelte';
import Align from './_Align.svelte';
import Nested from './_Nested.svelte';

var root = $.from_html(`<section><h2>Layout Grid</h2> <p>Try resizing your window to see the cells adapt to the new size.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/layout-grid</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('11uxx4g', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Layout Grid - SMUI';
		});
	});

	var node = $.sibling($.child(section), 10);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'layout-grid/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Span;
		},
		file: 'layout-grid/_Span.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Span');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Order;
		},
		file: 'layout-grid/_Order.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Order');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return FixedColumnWidth;
		},
		file: 'layout-grid/_FixedColumnWidth.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Fixed Column Width');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Align;
		},
		file: 'layout-grid/_Align.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Align');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_4 = $.text('Only use this if you must because it doesn\'t align well at some\n      resolutions.');

			$.append($$anchor, text_4);
		};

		Demo(node_5, {
			get component() {
				return Nested;
			},
			file: 'layout-grid/_Nested.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Nested');

				$.append($$anchor, text_5);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}