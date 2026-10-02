import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell
} from "flowbite-svelte";

export default function StripedColor($$renderer) {
	Table($$renderer, {
		striped: true,
		color: 'purple',
		children: ($$renderer) => {
			TableHead($$renderer, {
				children: ($$renderer) => {
					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Product name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Color`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Category`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Price`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<span class="sr-only">Edit</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				children: ($$renderer) => {
					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apple MacBook Pro 17"`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Silver`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Laptop`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$2999`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Microsoft Surface Pro`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->White`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Laptop PC`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$1999`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Magic Mouse 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Black`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Accessories`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$99`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Google Pixel Phone`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Gray`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Phone`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$799`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apple Watch 5`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Red`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Wearables`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$999`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>`);
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