import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`, 1);
var root_1 = $.from_html(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`, 1);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Columns</h2> <!> <h2>Columns with gap</h2> <!> <h2>Auto Columns</h2> <!> <h2>Template</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(10);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();

					$.next(10);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				columns: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();

					$.next(10);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				columns: 4,
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();

					$.next(10);
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				autoColumns: '160px',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();

					$.next(10);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				template: 'auto 1fr auto',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_1();

					$.next(4);
					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}