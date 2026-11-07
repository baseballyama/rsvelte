import * as $ from 'svelte/internal/server';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

export default function _Simple($$renderer) {
	DataTable($$renderer, {
		'table$aria-label': 'People list',
		style: 'max-width: 100%;',
		children: ($$renderer) => {
			Head($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						children: ($$renderer) => {
							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Favorite Color`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								numeric: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Favorite Number`);
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

			$$renderer.push(`<!----> `);

			Body($$renderer, {
				children: ($$renderer) => {
					Row($$renderer, {
						children: ($$renderer) => {
							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Steve`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Red`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								numeric: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->45`);
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
							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Sharon`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Purple`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								numeric: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->5`);
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
							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rodney`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Orange`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								numeric: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->32`);
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
							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Mack`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Blue`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Cell($$renderer, {
								numeric: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->12`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}