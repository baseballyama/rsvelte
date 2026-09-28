import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell
} from "flowbite-svelte";

export default function Head($$renderer) {
	Table($$renderer, {
		children: ($$renderer) => {
			TableHead($$renderer, {
				defaultRow: false,
				children: ($$renderer) => {
					$$renderer.push(`<tr>`);

					TableHeadCell($$renderer, {
						colspan: 2,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Product`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					TableHeadCell($$renderer, {
						colspan: 3,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Info`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></tr> <tr>`);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Brand`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Product name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Color`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Category`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Price`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></tr>`);
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
									$$renderer.push(`<!---->Apple`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Microsoft`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apple`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

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