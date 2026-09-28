import * as $ from 'svelte/internal/server';
import List, { Item, Separator, Text } from '@smui/list';

export default function _Simple($$renderer) {
	let clicked = 'nothing yet';

	$$renderer.push(`<div class="svelte-eam788">`);

	List($$renderer, {
		class: 'demo-list',
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

	$$renderer.push(`<!----></div> <pre class="status svelte-eam788">Clicked: ${$.escape(clicked)}</pre>`);
}