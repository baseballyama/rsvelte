import * as $ from 'svelte/internal/server';
import Fab, { Icon } from '@smui/fab';

export default function _Mini($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="flexy"><div class="margins">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		mini: true,
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		color: 'primary',
		onclick: () => clicked++,
		mini: true,
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}