import * as $ from 'svelte/internal/server';

import {
	Radio,
	Table,
	TableHead,
	TableHeadCell,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	Label
} from "flowbite-svelte";

export default function AlternativeSyntax($$renderer) {
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
										for: 'radio1',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Default radio`);
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
										for: 'radio2',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Disabled radio`);
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
									Radio($$renderer, { name: 'separate', id: 'radio1' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableBodyCell($$renderer, {
								children: ($$renderer) => {
									Radio($$renderer, { name: 'separate', id: 'radio2', disabled: true });
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
			Radio($$renderer, { name: 'separate', classes: { label: "ms-2" } });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}