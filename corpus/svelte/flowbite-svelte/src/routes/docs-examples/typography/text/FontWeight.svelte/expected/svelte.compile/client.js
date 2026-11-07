import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function FontWeight($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		size: '4xl',
		weight: 'thin',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Aa');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		size: '4xl',
		weight: 'extralight',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Aa');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		size: '4xl',
		weight: 'light',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Aa');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		size: '4xl',
		weight: 'normal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Aa');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	P(node_4, {
		size: '4xl',
		weight: 'medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Aa');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	P(node_5, {
		size: '4xl',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Aa');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	P(node_6, {
		size: '4xl',
		weight: 'bold',
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
		weight: 'extrabold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Aa');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	P(node_8, {
		size: '4xl',
		weight: 'black',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Aa');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}