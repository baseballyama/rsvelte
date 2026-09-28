import * as $ from 'svelte/internal/server';
import Fab, { Label, Icon } from '@smui/fab';

export default function _Extended($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="flexy"><div class="margins">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		extended: true,
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
					$$renderer.push(`<!---->Extended`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		color: 'primary',
		onclick: () => clicked++,
		extended: true,
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
					$$renderer.push(`<!---->Extended`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		extended: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Extended W/o Icon`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		color: 'primary',
		onclick: () => clicked++,
		extended: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Extended W/o Icon`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}