import * as $ from 'svelte/internal/server';
import List, { Item, Graphic, Separator, Text } from '@smui/list';

export default function _GraphicsDense($$renderer) {
	let clicked = 'nothing yet';

	$$renderer.push(`<div class="svelte-pgll8m">`);

	List($$renderer, {
		class: 'demo-list',
		dense: true,
		children: ($$renderer) => {
			Item($$renderer, {
				onSMUIAction: () => clicked = 'Edit',
				children: ($$renderer) => {
					Graphic($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->edit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Edit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Send',
				children: ($$renderer) => {
					Graphic($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->send`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Send`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Archive',
				children: ($$renderer) => {
					Graphic($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->archive`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Archive`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Delete',
				children: ($$renderer) => {
					Graphic($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->clear`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delete`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <pre class="status svelte-pgll8m">Clicked: ${$.escape(clicked)}</pre>`);
}