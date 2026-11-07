import * as $ from 'svelte/internal/server';
import MenuSurface from '@smui/menu-surface';
import List, { Item, Separator, Text } from '@smui/list';

export default function _Static($$renderer) {
	let clicked = 'nothing yet';

	MenuSurface($$renderer, {
		static: true,
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

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}