import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Seo, Text } from '@svelteuidev/core';

const code = `
<script>
    import { Seo } from '@svelteuidev/core';
<\/script>

<Seo
    title='Seo Demo'
    titleTemplate="%t% | SvelteUI"
 />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Seo_demo_usage($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Text(node, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Look at the webpage title');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Seo(node_1, { title: 'Seo Demo', titleTemplate: '%t% | SvelteUI' });
	$.append($$anchor, fragment);
}