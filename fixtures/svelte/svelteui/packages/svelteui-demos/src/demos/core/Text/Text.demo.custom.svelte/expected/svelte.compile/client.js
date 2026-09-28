import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Code, Text } from '@svelteuidev/core';

const code = `<script>
	import { Code, Text } from '@svelteuidev/core';
<\/script>

<Text root="a">This is a anchor now</Text>
<Text root="p">This is a paragraph</Text>
<Text root={Code}>This is a Code Component</Text>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Text_demo_custom($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Text(node, {
		root: 'a',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This is a anchor now');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		root: 'p',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('This is a paragraph');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Text(node_2, {
		get root() {
			return Code;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('This is a Code Component');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}