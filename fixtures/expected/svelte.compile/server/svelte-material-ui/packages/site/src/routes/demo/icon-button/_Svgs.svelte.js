import * as $ from 'svelte/internal/server';
import { mdiFormatColorFill, mdiWrench, mdiCurrencyUsd } from '@mdi/js';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Svgs($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		children: ($$renderer) => {
			Icon($$renderer, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$renderer) => {
					$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiFormatColorFill)}></path>`);
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
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$renderer) => {
					$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiWrench)}></path>`);
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
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$renderer) => {
					$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiCurrencyUsd)}></path>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> (no ripple)</div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}