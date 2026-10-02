import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiFilterVariant } from '@mdi/js';
import { Button, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid grid-flow-col"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_1 = $.from_html(`<div class="grid grid-flow-col gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_2 = $.from_html(`<div class="grid grid-flow-col justify-start gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_3 = $.from_html(`<div class="grid grid-flow-col justify-center gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_4 = $.from_html(`<div class="grid grid-flow-col justify-end gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_5 = $.from_html(`<div class="grid grid-flow-col grid-cols-[auto,1fr,auto] gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_6 = $.from_html(`<div class="grid"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_7 = $.from_html(`<div class="grid gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_8 = $.from_html(`<div class="grid justify-start gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_9 = $.from_html(`<div class="grid justify-center gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_10 = $.from_html(`<div class="grid justify-end gap-2"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_11 = $.from_html(`<div class="grid grid-rows-[auto,1fr,auto] gap-2 h-64"><div class="border">item</div> <div class="border">item</div> <div class="border">item</div></div>`);
var root_12 = $.from_html(`<div class="inline-grid place-items-center"><!> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center">3</div></div>`);
var root_13 = $.from_html(`<div class="inline-grid"><!> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 -mr-1 -mt-1 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div></div>`);
var root_14 = $.from_html(`<div class="inline-grid"><!> <div class="col-span-full row-span-full bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div></div>`);
var root_15 = $.from_html(`<div class="inline-grid"><!> <div class="col-span-full row-span-full self-start justify-self-end bg-danger rounded-full h-4 w-4 -mt-1 text-xs flex items-center justify-center border border-surface-100"></div> <div class="col-span-full row-span-full self-end justify-self-end bg-success rounded-full h-4 w-4 text-xs flex items-center justify-center border border-surface-100"></div></div>`);
var root_16 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Justify</h2> <!> <!> <!> <h2>Template</h2> <!> <!> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Justify</h2> <!> <!> <!> <h2>Template</h2> <!> <!> <h2>Default</h2> <!> <h2>Corner with Button</h2> <!> <h2>Corner with Icon Button</h2> <!> <h2>Corner (multi) with Icon Button</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_16();
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

	var node_3 = $.sibling(node_2, 2);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_3();

			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

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

	var node_6 = $.sibling(node_5, 2);

	SectionDivider(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Vertical');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_6();

			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_7();

			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_8();

			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_9();

			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_10();

			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var div_11 = root_11();

			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	SectionDivider(node_13, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Stack');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			var div_12 = root_12();
			var node_15 = $.child(div_12);

			Button(node_15, {
				class: 'col-span-full row-span-full border',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Example');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_12);
			$.append($$anchor, div_12);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_14, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			var div_13 = root_13();
			var node_17 = $.child(div_13);

			Button(node_17, {
				class: 'col-span-full row-span-full border',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Example');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_13);
			$.append($$anchor, div_13);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_16, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var div_14 = root_14();
			var node_19 = $.child(div_14);

			Button(node_19, {
				get icon() {
					return mdiFilterVariant;
				},
				class: 'col-span-full row-span-full border p-3'
			});

			$.next(2);
			$.reset(div_14);
			$.append($$anchor, div_14);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_18, 4);

	Preview(node_20, {
		children: ($$anchor, $$slotProps) => {
			var div_15 = root_15();
			var node_21 = $.child(div_15);

			Button(node_21, {
				get icon() {
					return mdiFilterVariant;
				},
				class: 'col-span-full row-span-full border p-3'
			});

			$.next(4);
			$.reset(div_15);
			$.append($$anchor, div_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}