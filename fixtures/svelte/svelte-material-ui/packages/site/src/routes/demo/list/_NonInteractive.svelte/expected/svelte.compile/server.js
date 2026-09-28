import * as $ from 'svelte/internal/server';
import List, { Item, Separator, Text } from '@smui/list';

export default function _NonInteractive($$renderer) {
	$$renderer.push(`<div class="svelte-66u1g7">`);

	List($$renderer, {
		class: 'demo-list',
		nonInteractive: true,
		children: ($$renderer) => {
			Item($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Thing 1`);
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
				activated: true,
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Thing 2`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Thing 3`);
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
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Thing 4`);
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

	$$renderer.push(`<!----></div>`);
}