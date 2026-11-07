import * as $ from 'svelte/internal/server';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Colored($$renderer) {
	$$renderer.push(`<div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		class: 'my-colored-icon-button',
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
		class: 'my-colored-icon-button',
		disabled: true,
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

	$$renderer.push(`<!----></div>`);
}