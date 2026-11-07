import * as $ from 'svelte/internal/server';
import { Column, Grid, Row } from "carbon-components-svelte";

export default function AspectRatioColumns($$renderer) {
	Grid($$renderer, {
		children: ($$renderer) => {
			Row($$renderer, {
				children: ($$renderer) => {
					Column($$renderer, {
						aspectRatio: '2x1',
						children: ($$renderer) => {
							$$renderer.push(`<!---->2x1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						aspectRatio: '2x1',
						children: ($$renderer) => {
							$$renderer.push(`<!---->2x1`);
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
}