import * as $ from 'svelte/internal/server';
import Button, { Label, Icon } from '@smui/button';

export default function _Round($$renderer) {
	let clicked = 0;

	Button($$renderer, {
		onclick: () => clicked++,
		variant: 'raised',
		class: 'button-shaped-round',
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
		class: 'button-shaped-round',
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
		class: 'button-shaped-round',
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
		onclick: () => clicked++,
		variant: 'unelevated',
		class: 'button-shaped-round',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => clicked++,
		variant: 'outlined',
		class: 'button-shaped-round',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Trailing Icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}