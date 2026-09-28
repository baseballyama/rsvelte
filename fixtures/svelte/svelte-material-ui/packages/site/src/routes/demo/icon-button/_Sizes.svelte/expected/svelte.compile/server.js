import * as $ from 'svelte/internal/server';
import { mdiWrench } from '@mdi/js';
import IconButton, { Icon } from '@smui/icon-button';

export default function _Sizes($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		size: 'normal',
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

	$$renderer.push(`<!----> (normal = standard icon button size)</div> <div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		size: 'mini',
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

	$$renderer.push(`<!----> (mini = same size as mini FAB)</div> <div style="display: flex; align-items: center;">`);

	IconButton($$renderer, {
		onclick: () => clicked++,
		size: 'button',
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

	$$renderer.push(`<!----> (button = same height as button)</div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}