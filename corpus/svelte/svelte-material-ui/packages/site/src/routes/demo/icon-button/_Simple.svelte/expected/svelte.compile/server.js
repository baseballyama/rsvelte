import * as $ from 'svelte/internal/server';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Simple($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
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

	$$renderer.push(`<!----></div> <div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		disabled: true,
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->search`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> (disabled)</div> <div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		ripple: false,
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->add_shopping_cart`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> (no ripple)</div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}