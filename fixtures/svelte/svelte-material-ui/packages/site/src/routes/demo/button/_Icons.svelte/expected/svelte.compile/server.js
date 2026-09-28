import * as $ from 'svelte/internal/server';
import Button, { Label, Icon } from '@smui/button';

export default function _Icons($$renderer) {
	let clicked = 0;

	Button($$renderer, {
		onclick: () => clicked++,
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
					$$renderer.push(`<!---->Leading Icon`);
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

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
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
					$$renderer.push(`<!---->Leading Icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'secondary',
		onclick: () => clicked++,
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