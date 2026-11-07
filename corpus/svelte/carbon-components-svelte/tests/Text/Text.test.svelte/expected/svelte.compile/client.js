import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Text from "carbon-components-svelte/Text/Text.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Text_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Text(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default body');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		tag: 'h1',
		type: 'productive-heading-04',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Heading');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Text(node_2, {
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Secondary text');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Text(node_3, {
		type: 'code-01',
		color: 'error',
		class: 'custom',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Code');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Text(node_4, {
		tag: 'span',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Inline span');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Text(node_5, {
		color: 'helper',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Color only');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Text(node_6, {
		type: 'body-long-01',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Semibold text');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Text(node_7, {
		type: 'body-long-01',
		italic: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Italic text');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Text(node_8, {
		type: 'body-long-01',
		family: 'mono',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Mono text');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Text(node_9, {
		type: 'body-short-01',
		wrap: 'break-word',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Break word text');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Text(node_10, {
		type: 'body-short-01',
		wrap: 'nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Nowrap text');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Text(node_11, {
		tag: 'h2',
		type: 'productive-heading-04',
		balance: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Balanced heading');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Text(node_12, {
		type: 'body-long-01',
		maxWidth: 320,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Max width px');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Text(node_13, {
		type: 'body-long-01',
		maxWidth: '38ch',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Max width ch');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Text(node_14, {
		type: 'body-long-01',
		fullWidth: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Full width text');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Text(node_15, {
		type: 'body-long-01',
		weight: 'semibold',
		color: 'primary',
		maxWidth: '42ch',
		class: 'combined',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('Combined modifiers');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Text(node_16, {
		type: 'body-long-01',
		lines: 3,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_16 = $.text('Truncated text');

			$.append($$anchor, text_16);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}