import * as $ from 'svelte/internal/server';
import { Column, Grid, Row } from "carbon-components-svelte";

export default function CondensedGrid($$renderer) {
	Grid($$renderer, {
		condensed: true,
		children: ($$renderer) => {
			Row($$renderer, {
				children: ($$renderer) => {
					Column($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Column`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Column`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Column`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Column`);
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