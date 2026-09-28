import * as $ from 'svelte/internal/server';
import { mdiPlus } from '@mdi/js';
import Fab, { Icon } from '@smui/fab';

export default function _Svg($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="flexy svelte-1ut572z"><div class="margins svelte-1ut572z">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		children: ($$renderer) => {
			Icon($$renderer, {
				tag: 'svg',
				viewBox: '2 2 20 20',
				children: ($$renderer) => {
					$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiPlus)} class="svelte-1ut572z"></path>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <pre class="status svelte-1ut572z">Clicked: ${$.escape(clicked)}</pre>`);
}