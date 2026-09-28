import * as $ from 'svelte/internal/server';
import { Column, Grid, Row, Stack } from "carbon-components-svelte";

export default function PaddedGrid($$renderer) {
	Stack($$renderer, {
		gap: 5,
		children: ($$renderer) => {
			$$renderer.push(`<div style="padding: var(--cds-spacing-05)">Adding padding to Grid applies it to columns in all rows:</div> `);

			Grid($$renderer, {
				padding: true,
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

			$$renderer.push(`<!----> <div style="padding: var(--cds-spacing-05)">Adding padding to a Row only applies to its columns:</div> `);

			Grid($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						padding: true,
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

					$$renderer.push(`<!----> `);

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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div style="padding: var(--cds-spacing-05)">Adding padding to a specific column only applies it to the column:</div> `);

			Grid($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						children: ($$renderer) => {
							Column($$renderer, {
								padding: true,
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}