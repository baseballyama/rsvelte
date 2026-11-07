import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_1 = $.from_html(`<div class="grid gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-4"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-4 gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_4 = $.from_html(`<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_5 = $.from_html(`<div class="grid grid-cols-[auto,1fr,auto] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_6 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Columns</h2> <!> <h2>Columns with gap</h2> <!> <h2>Auto Columns</h2> <!> <h2>Template</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_6();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_3();

			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_4();

			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_5();

			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}