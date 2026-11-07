import * as $ from 'svelte/internal/server';
import MenuSurface from '@smui/menu-surface';
import Textfield from '@smui/textfield';
import Button from '@smui/button';

export default function _Anchored($$renderer) {
	let surface;
	let name = '';
	let email = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="min-width: 100px;">`);

		Button($$renderer, {
			onclick: () => surface.setOpen(true),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open Menu Surface`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		MenuSurface($$renderer, {
			anchorCorner: 'BOTTOM_LEFT',
			children: ($$renderer) => {
				$$renderer.push(`<div style="margin: 1em; display: flex; flex-direction: column; align-items: flex-end;">`);

				Textfield($$renderer, {
					label: 'Name',
					get value() {
						return name;
					},

					set value($$value) {
						name = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Textfield($$renderer, {
					label: 'Email',
					type: 'email',
					get value() {
						return email;
					},

					set value($$value) {
						email = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					style: 'margin-top: 1em;',
					onclick: () => surface.setOpen(false),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}