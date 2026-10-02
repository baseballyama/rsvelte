import * as $ from 'svelte/internal/server';

import {
	Checkbox,
	Table,
	TableHead,
	TableHeadCell,
	TableBody,
	TableBodyCell,
	Label,
	TableBodyRow
} from "flowbite-svelte";

export default function Alternative($$renderer) {
	Table($$renderer, {
		children: ($$renderer) => {
			TableHead($$renderer, {
				children: ($$renderer) => {
					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left column`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableHeadCell($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right column`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				class: 'divide-y dark:divide-gray-700',
				children: ($$renderer) => {
					TableBodyRow($$renderer, {
						class: 'divide-x rtl:divide-x-reverse dark:divide-gray-700',
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Label($$renderer, {
										for: 'checkbox1',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Default checkbox`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Label($$renderer, {
										for: 'checkbox2',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Disabled checkbox`);
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

					$$renderer.push(`<!----> `);

					TableBodyRow($$renderer, {
						class: 'divide-x rtl:divide-x-reverse dark:divide-gray-700',
						children: ($$renderer) => {
							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Checkbox($$renderer, { id: 'checkbox1', checked: true });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Checkbox($$renderer, { id: 'checkbox2', disabled: true });
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

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		color: 'red',
		class: 'mt-4 flex items-center font-bold italic',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Label on the other side `);
			Checkbox($$renderer, { classes: { div: "ms-2" } });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}