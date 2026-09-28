import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Title } from '@svelteuidev/core';

const code = `<script>
	import { Title } from '@svelteuidev/core';
<\/script>

<Title order={1}>This is h1 title</Title>
<Title order={2}>This is h2 title</Title>
<Title order={3}>This is h3 title</Title>
<Title order={4}>This is h4 title</Title>
<Title order={5}>This is h5 title</Title>
<Title order={6}>This is h6 title</Title>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Title_demo_usage($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Title(node, {
		order: 1,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This is h1 title');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Title(node_1, {
		order: 2,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('This is h2 title');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Title(node_2, {
		order: 3,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('This is h3 title');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Title(node_3, {
		order: 4,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('This is h4 title');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Title(node_4, {
		order: 5,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('This is h5 title');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Title(node_5, {
		order: 6,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('This is h6 title');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}