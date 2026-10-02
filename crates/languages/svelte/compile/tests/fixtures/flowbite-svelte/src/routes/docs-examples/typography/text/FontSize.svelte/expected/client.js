import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function FontSize($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		size: 'xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Aa');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Aa');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		size: 'base',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Aa');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Aa');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	P(node_4, {
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Aa');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	P(node_5, {
		size: '2xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Aa');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	P(node_6, {
		size: '3xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Aa');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	P(node_7, {
		size: '4xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Aa');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	P(node_8, {
		size: '5xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Aa');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	P(node_9, {
		size: '6xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Aa');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	P(node_10, {
		size: '7xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Aa');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	P(node_11, {
		size: '8xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Aa');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	P(node_12, {
		size: '9xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Aa');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}