import * as $ from 'svelte/internal/server';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Touch($$renderer) {
	let clicked = 0;

	IconButton($$renderer, {
		onclick: () => clicked++,
		touch: true,
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->build`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}