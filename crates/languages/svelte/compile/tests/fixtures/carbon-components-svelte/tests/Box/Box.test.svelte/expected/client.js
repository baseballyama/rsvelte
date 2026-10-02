import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Box from "carbon-components-svelte/Box/Box.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Box_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Box(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default box');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Box(node_1, {
		tag: 'section',
		fill: 'layer-01',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Layer fill');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Box(node_2, {
		fill: 'background',
		border: 'subtle',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Fill and border');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Box(node_3, {
		padding: 5,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Padding scale');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Box(node_4, {
		padding: '1.5rem',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Custom padding');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Box(node_5, {
		paddingX: 3,
		paddingY: 5,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Axis padding');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Box(node_6, {
		margin: 4,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Margin scale');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Box(node_7, {
		fullWidth: true,
		maxWidth: 480,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Full width capped');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Box(node_8, {
		width: '12rem',
		minWidth: '8rem',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Custom width');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Box(node_9, {
		fill: 'layer-02',
		padding: 6,
		border: 'subtle',
		class: 'combined',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Combined modifiers');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}