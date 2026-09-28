import * as $ from 'svelte/internal/server';
import Menu from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';
import Button, { Label } from '@smui/button';

export default function _Anchored($$renderer) {
	let menu;
	let clicked = 'nothing yet';

	$$renderer.push(`<div style="min-width: 100px;">`);

	Button($$renderer, {
		onclick: () => menu.setOpen(true),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Menu`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Menu($$renderer, {
		children: ($$renderer) => {
			List($$renderer, {
				children: ($$renderer) => {
					Item($$renderer, {
						onSMUIAction: () => clicked = 'Cut',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cut`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Copy',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Copy`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Paste',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Paste`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Delete',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}