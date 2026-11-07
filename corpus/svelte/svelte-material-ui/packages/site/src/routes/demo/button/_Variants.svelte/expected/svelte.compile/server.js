import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _Variants($$renderer) {
	let clicked = 0;

	Button($$renderer, {
		onclick: () => clicked++,
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

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
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
		color: 'secondary',
		onclick: () => clicked++,
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
		color: 'secondary',
		onclick: () => clicked++,
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