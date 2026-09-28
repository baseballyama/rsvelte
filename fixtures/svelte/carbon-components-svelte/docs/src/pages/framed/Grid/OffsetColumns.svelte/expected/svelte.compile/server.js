import * as $ from 'svelte/internal/server';
import { Column, Grid, Row } from "carbon-components-svelte";

export default function OffsetColumns($$renderer) {
	Grid($$renderer, {
		children: ($$renderer) => {
			Row($$renderer, {
				children: ($$renderer) => {
					Column($$renderer, {
						sm: { span: 1, offset: 3 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Offset 3`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: { span: 2, offset: 2 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Offset 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: { span: 3, offset: 1 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Offset 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Column($$renderer, {
						sm: { span: 4, offset: 0 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Offset 0`);
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