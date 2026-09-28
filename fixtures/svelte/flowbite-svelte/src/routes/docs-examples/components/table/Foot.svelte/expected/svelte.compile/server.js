import * as $ from 'svelte/internal/server';

import {
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell
} from "flowbite-svelte";

export default function Foot($$renderer) {
	Table($$renderer, {
		border: false,
		children: ($$renderer) => {
			TableHead($$renderer, {
				class: 'bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400',
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
							$$renderer.push(`<!---->Qty`);
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
									$$renderer.push(`<!---->1`);
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
									$$renderer.push(`<!---->Microsoft Surface Pro`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
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
									$$renderer.push(`<!---->Magic Mouse 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
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

			$$renderer.push(`<!----> <tfoot><tr class="font-semibold text-gray-900 dark:text-white"><th scope="row" class="px-6 py-3 text-base">Total</th><td class="px-6 py-3">3</td><td class="px-6 py-3">21,000</td></tr></tfoot>`);
		},
		$$slots: { default: true }
	});
}