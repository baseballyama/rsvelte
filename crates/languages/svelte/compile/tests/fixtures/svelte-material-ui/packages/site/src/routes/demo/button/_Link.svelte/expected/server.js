import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _Link($$renderer) {
	let clicked = 0;

	Button($$renderer, {
		onclick: () => clicked++,
		href: 'http://example.com',
		target: '_blank',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}