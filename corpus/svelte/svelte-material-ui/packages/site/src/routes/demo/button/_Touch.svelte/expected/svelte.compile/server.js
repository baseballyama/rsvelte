import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _Touch($$renderer) {
	let clicked = 0;

	Button($$renderer, {
		onclick: () => clicked++,
		touch: true,
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
		onclick: () => clicked++,
		touch: true,
		variant: 'raised',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Raised`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => clicked++,
		touch: true,
		variant: 'unelevated',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Unelevated`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => clicked++,
		touch: true,
		variant: 'outlined',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outlined`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}