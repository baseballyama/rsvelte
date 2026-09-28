import * as $ from 'svelte/internal/server';
import { Column, Grid, Row } from "carbon-components-svelte";

export default function ResponsiveGrid($$renderer) {
	Grid($$renderer, {
		children: ($$renderer) => {
			Row($$renderer, {
				children: ($$renderer) => {
					Column($$renderer, {
						sm: 1,
						md: 4,
						lg: 8,
						children: ($$renderer) => {
							$$renderer.push(`<!---->sm: 1, md: 4, lg: 8`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: 1,
						md: 2,
						lg: 2,
						children: ($$renderer) => {
							$$renderer.push(`<!---->sm: 1, md: 2, lg: 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: 1,
						md: 1,
						lg: 1,
						children: ($$renderer) => {
							$$renderer.push(`<!---->sm: 1, md: 1, lg: 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: 1,
						md: 1,
						lg: 1,
						children: ($$renderer) => {
							$$renderer.push(`<!---->sm: 1, md: 1, lg: 1`);
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