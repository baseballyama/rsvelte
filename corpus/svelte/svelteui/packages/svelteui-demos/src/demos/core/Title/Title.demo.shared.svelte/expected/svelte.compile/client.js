import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Title } from '@svelteuidev/core';

const code = `<script>
	import { Title } from '@svelteuidev/core';
<\/script>


<Title order={1}>This is h1 title</Title>
<Title order={1} variant='gradient' gradient={{from: 'blue', to: 'red', deg: 45}}>This is h1 title with a twist</Title>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Title_demo_shared($$anchor) {
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
		order: 1,
		variant: 'gradient',
		gradient: { from: 'blue', to: 'red', deg: 45 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('This is h1 title with a twist');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}