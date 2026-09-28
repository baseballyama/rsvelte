import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _SecondaryColor($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="svelte-1r2e477">`);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
		disabled: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Disabled`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
		ripple: false,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->No Ripple`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
		class: 'myClass',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->With a Class`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <pre class="status svelte-1r2e477">Clicked: ${$.escape(clicked)}</pre>`);
}