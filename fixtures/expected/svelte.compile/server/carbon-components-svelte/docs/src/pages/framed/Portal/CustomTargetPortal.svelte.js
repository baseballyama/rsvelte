import * as $ from 'svelte/internal/server';
import { Portal, Stack, Tile } from "carbon-components-svelte";

export default function CustomTargetPortal($$renderer) {
	let target = null;

	Stack($$renderer, {
		gap: 4,
		children: ($$renderer) => {
			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>Portal is declared here.</div> `);

					Portal($$renderer, {
						target,
						children: ($$renderer) => {
							$$renderer.push(`<strong>Portalled content</strong>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>But mounted into this container via <code>target</code>.</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}