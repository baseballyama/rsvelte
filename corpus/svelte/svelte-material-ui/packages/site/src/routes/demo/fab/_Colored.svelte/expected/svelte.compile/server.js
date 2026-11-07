import * as $ from 'svelte/internal/server';
import Fab, { Label, Icon } from '@smui/fab';

export default function _Colored($$renderer) {
	$$renderer.push(`<div class="flexy"><div class="margins">`);

	Fab($$renderer, {
		class: 'my-colored-fab',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		class: 'my-colored-fab',
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

	$$renderer.push(`<!----></div></div>`);
}